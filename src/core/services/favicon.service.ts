import { MessageBroker } from "../messaging/message.broker";
import { HAS_PROTOCOL_REGEX } from "../config/constants";
import type { FaviconResponse } from "../messaging/message.types";

const MAX_CACHE_SIZE = 200;

const faviconCache = new Map<string, string>();
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

function cacheDataUrl(key: string, dataUrl: string): void {
  if (faviconCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = faviconCache.keys().next().value;
    if (oldestKey !== undefined) {
      faviconCache.delete(oldestKey);
    }
  }
  faviconCache.set(key, dataUrl);
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
        cacheDataUrl(key, response.dataUrl);
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
