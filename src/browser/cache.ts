export function loadFaviconFromCache(
  url: string,
  imgElement: HTMLImageElement,
) {
  chrome.runtime.sendMessage({ action: "getFavicon", url: url }, (response) => {
    if (chrome.runtime.lastError) {
      return;
    }

    if (response && response.status === "success" && response.dataUrl) {
      imgElement.src = response.dataUrl;
    } else {
      let hostname = "...";
      try {
        hostname = new URL(url).hostname;
      } catch (_e) {}
      imgElement.src = `https://favicon.is/${hostname}`;
    }
  });
}
