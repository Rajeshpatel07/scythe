import { MessageBroker } from "../../../core/messaging/message.broker";

export function loadFaviconFromCache(
  url: string,
  imgElement: HTMLImageElement,
  size?: number,
) {
  MessageBroker.send({ action: "getFavicon", url, size }).then((response) => {
    if (response && response.status === "success" && response.dataUrl) {
      imgElement.src = response.dataUrl;
    } else {
      let hostname = "...";
      const havePrefix = /^https?:\/\//.test(url);
      if (!havePrefix) url = `https://${url}`;
      try {
        hostname = new URL(url).hostname;
      } catch (_e) {}
      imgElement.src = `https://favicon.is/${hostname}`;
    }
  }).catch(() => {
      let hostname = "...";
      const havePrefix = /^https?:\/\//.test(url);
      if (!havePrefix) url = `https://${url}`;
      try {
        hostname = new URL(url).hostname;
      } catch (_e) {}
      imgElement.src = `https://favicon.is/${hostname}`;
  });
}

export async function getHighResFallback(
  url: string,
): Promise<{ status: string; dataUrl: string | null }> {
  try {
    const imgUrl = `https://favicon.vemetric.com/${url}?size=128&format=webp`;

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
