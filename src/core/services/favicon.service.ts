import { MessageBroker } from "../messaging/message.broker";
import { HAS_PROTOCOL_REGEX } from "../config/constants";

function getFaviconFallbackUrl(url: string): string {
  let hostname = "...";
  const havePrefix = HAS_PROTOCOL_REGEX.test(url);
  if (!havePrefix) url = `https://${url}`;
  try {
    hostname = new URL(url).hostname;
  } catch (_e) { }
  return `https://www.google.com/s2/favicons?domain_url=https://${hostname}`;
}

export function loadFaviconFromCache(
  url: string,
  imgElement: HTMLImageElement,
  size?: number,
) {
  MessageBroker.send({ action: "getFavicon", url, size })
    .then((response) => {
      if (response && response.status === "success" && response.dataUrl) {
        imgElement.src = response.dataUrl;
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
): Promise<{ status: string; dataUrl: string | null }> {
  try {
    const imgUrl = `https://www.google.com/s2/favicons?sz=128&domain_url=https://${url}`;
    const response = await fetch(imgUrl);
    if (!response.ok) {
      return { status: "failed", dataUrl: null };
    }
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({ status: "success", dataUrl: reader.result as string });
      };
      reader.onerror = () => {
        resolve({ status: "failed", dataUrl: null });
      };
      reader.readAsDataURL(blob);
    });
  } catch (_err) {
    return { status: "error", dataUrl: null };
  }
}
