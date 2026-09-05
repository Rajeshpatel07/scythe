import type { FaviconResponse } from "../../core/messaging/message.types";

const FETCH_TIMEOUT_MS = 5000;

const pendingHighResFavicon = new Map<string, Promise<FaviconResponse>>();

export function buildChromeFaviconUrl(
  pageUrl: string,
  imgSize: number,
): string {
  return `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(pageUrl)}&size=${imgSize}&allowGoogle=true`;
}

export function buildHighResFaviconUrl(hostname: string): string {
  return `https://www.google.com/s2/favicons?sz=128&domain_url=https://${hostname}`;
}

async function fetchAsDataUrl(url: string): Promise<FaviconResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw Error();
    const blob = await response.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        clearTimeout(timeoutId);
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject();
        }
      };
      reader.onerror = () => {
        clearTimeout(timeoutId);
        reject();
      };
      reader.readAsDataURL(blob);
    });
    return { status: "success", dataUrl };
  } catch {
    clearTimeout(timeoutId);
    return { status: "error", dataUrl: null };
  }
}

export function fetchChromeFaviconDataUrl(
  pageUrl: string,
  imgSize: number,
): Promise<FaviconResponse> {
  return fetchAsDataUrl(buildChromeFaviconUrl(pageUrl, imgSize));
}

export function fetchHighResDataUrl(hostname: string): Promise<FaviconResponse> {
  const pending = pendingHighResFavicon.get(hostname);
  if (pending) return pending;

  const promise = fetchAsDataUrl(buildHighResFaviconUrl(hostname)).finally(
    () => pendingHighResFavicon.delete(hostname),
  );
  pendingHighResFavicon.set(hostname, promise);
  return promise;
}
