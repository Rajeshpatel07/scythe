import { MessageBroker } from "../messaging/message.broker";
import type { FaviconResponse } from "../messaging/message.types";
import { LruCache } from "../utils/lru";
import { storage } from "../storage/storage.utils";

const MAX_CACHE_SIZE = 200;
const FAVICON_INDEX_KEY = "favIndex";
const MAX_PERSISTED_FAVICONS = 100;

const faviconCache = new LruCache<string, string>(MAX_CACHE_SIZE);
const pendingFavicons = new Map<string, Promise<string | null>>();
// Chrome answers the favicon service with its built-in default icon
// (HTTP 200, indistinguishable from a real cached icon) whenever it has
// nothing cached for a page, so a plain failure check would show the
// browser's default icon. Probe that default once per size with a URL
// that can never be cached and compare bytes to recognize it.
const genericFaviconFixtures = new Map<number, Promise<string | null>>();

function getGenericFaviconDataUrl(size: number): Promise<string | null> {
  let pending = genericFaviconFixtures.get(size);
  if (pending) return pending;

  pending = (async () => {
    try {
      const probeUrl = `https://scythe-default-favicon-probe-${Date.now().toString(36)}.invalid/`;
      const response = await MessageBroker.send({
        action: "getFavicon",
        url: probeUrl,
        size,
      });
      if (response?.status === "success" && response.dataUrl) {
        return response.dataUrl;
      }
      return null;
    } catch {
      return null;
    }
  })();

  genericFaviconFixtures.set(size, pending);
  return pending;
}

async function isGenericFavicon(
  dataUrl: string,
  size: number,
): Promise<boolean> {
  const generic = await getGenericFaviconDataUrl(size);
  return generic !== null && generic === dataUrl;
}

function cacheKey(url: string, size?: number): string {
  return `${size ?? 32}|${url}`;
}

function getFaviconDataUrl(url: string, size?: number): Promise<string | null> {
  const iconSize = size ?? 32;
  const key = cacheKey(url, iconSize);
  const cached = faviconCache.get(key);
  if (cached !== undefined) {
    return Promise.resolve(cached);
  }

  const pending = pendingFavicons.get(key);
  if (pending) return pending;

  const promise = MessageBroker.send({ action: "getFavicon", url, size })
    .then(async (response) => {
      if (response?.status === "success" && response.dataUrl) {
        // The favicon service answers its built-in default icon (HTTP 200)
        // for pages with nothing cached, which would otherwise masquerade
        // as a real favicon; treat it as "no favicon" so callers fall back.
        if (await isGenericFavicon(response.dataUrl, iconSize)) {
          return null;
        }
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

function scytheLogoUrl(): string {
  return chrome.runtime.getURL("src/assets/icon48.png");
}

/**
 * Loads the favicon from Chrome's favicon service and falls back to the
 * extension logo when the service has nothing cached or fails, instead of
 * reaching out to Google's favicon server.
 */
export function loadFaviconWithLogoFallback(
  url: string,
  imgElement: HTMLImageElement,
  size?: number,
): void {
  getFaviconDataUrl(url, size)
    .then((dataUrl) => {
      imgElement.src = dataUrl ?? scytheLogoUrl();
    })
    .catch(() => {
      imgElement.src = scytheLogoUrl();
    });
}

export function loadFaviconFromCache(
  url: string,
  imgElement: HTMLImageElement,
  size?: number,
): void {
  getFaviconDataUrl(url, size)
    .then((dataUrl) => {
      imgElement.src = dataUrl ?? scytheLogoUrl();
    })
    .catch(() => {
      imgElement.src = scytheLogoUrl();
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
      overflow > 0
        ? nextIndex.splice(nextIndex.length - overflow, overflow)
        : [];
    await storage.local.set({ [key]: dataUrl, favIndex: nextIndex });

    if (evicted.length > 0) {
      await storage.local.remove(evicted);
    }
  } catch {
    // Persistence is best-effort; the in-memory cache still serves the session
  }
}
