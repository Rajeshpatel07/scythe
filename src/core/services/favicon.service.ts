import { MessageBroker } from "../messaging/message.broker";
import { HAS_PROTOCOL_REGEX } from "../config/constants";
import type { FaviconResponse } from "../messaging/message.types";
import { LruCache } from "../utils/lru";
import { storage } from "../storage/storage.utils";

const MAX_CACHE_SIZE = 200;
const FAVICON_INDEX_KEY = "favIndex";
const MAX_PERSISTED_FAVICONS = 100;

const faviconCache = new LruCache<string, string>(MAX_CACHE_SIZE);
const pendingFavicons = new Map<string, Promise<string | null>>();

function getFaviconFallbackUrl(url: string): string {
  const prefixed = HAS_PROTOCOL_REGEX.test(url) ? url : `https://${url}`;
  try {
    const hostname = new URL(prefixed).hostname;
    return `https://www.google.com/s2/favicons?domain_url=https://${hostname}`;
  } catch {
    return `https://www.google.com/s2/favicons?domain_url=https://${url}`;
  }
}

function cacheKey(url: string, size?: number): string {
  return `${size ?? 32}|${url}`;
}

function getFaviconDataUrl(url: string, size?: number): Promise<string | null> {
  const key = cacheKey(url, size);
  const cached = faviconCache.get(key);
  if (cached !== undefined) {
    return Promise.resolve(cached);
  }

  const pending = pendingFavicons.get(key);
  if (pending) return pending;

  const promise = MessageBroker.send({ action: "getFavicon", url, size })
    .then((response) => {
      if (response?.status === "success" && response.dataUrl) {
        faviconCache.set(key, response.dataUrl);
        return response.dataUrl;
      }
      return null;
    })
    .catch(() => null)
    .finally(() => {
      pendingFavicons.delete(key);
    });

  pendingFavicons.set(key, promise);
  return promise;
}

export function loadFaviconFromCache(
  url: string,
  imgElement: HTMLImageElement,
  size?: number,
): void {
  getFaviconDataUrl(url, size)
    .then((dataUrl) => {
      if (dataUrl) {
        imgElement.src = dataUrl;
      } else {
        imgElement.src = getFaviconFallbackUrl(url);
      }
    })
    .catch(() => {
      imgElement.src = getFaviconFallbackUrl(url);
    });
}

export async function getHighResFallback(
  url: string,
): Promise<FaviconResponse> {
  try {
    const response = await MessageBroker.send({
      action: "getHighResFavicon",
      url: url,
    });
    return {
      status: response.status,
      dataUrl: response.dataUrl,
    };
  } catch {
    return { status: "error", dataUrl: null };
  }
}

async function getFaviconIndex(): Promise<string[]> {
  try {
    const result = await storage.local.get<string[]>([FAVICON_INDEX_KEY]);
    return Array.isArray(result.favIndex) ? result.favIndex : [];
  } catch {
    return [];
  }
}

export async function persistFavicon(
  hostname: string,
  dataUrl: string,
  isCurrent?: () => boolean,
): Promise<void> {
  const key = `fav_${hostname}`;
  try {
    const index = await getFaviconIndex();
    if (isCurrent && !isCurrent()) return;

    const nextIndex = [key, ...index.filter((entry) => entry !== key)];
    const overflow = nextIndex.length - MAX_PERSISTED_FAVICONS;
    const evicted =
      overflow > 0 ? nextIndex.splice(nextIndex.length - overflow, overflow) : [];
    await storage.local.set({ [key]: dataUrl, favIndex: nextIndex });

    if (evicted.length > 0) {
      await storage.local.remove(evicted);
    }
  } catch {
    // Persistence is best-effort; the in-memory cache still serves the session
  }
}
