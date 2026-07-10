import { MessageBroker } from "../messaging/message.broker";
import { HAS_PROTOCOL_REGEX } from "../config/constants";

function getFaviconFallbackUrl(url: string): string {
  const prefixed = HAS_PROTOCOL_REGEX.test(url) ? url : `https://${url}`;
  try {
    const hostname = new URL(prefixed).hostname;
    return `https://www.google.com/s2/favicons?domain_url=https://${hostname}`;
  } catch {
    return `https://www.google.com/s2/favicons?domain_url=https://${url}`;
  }
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
