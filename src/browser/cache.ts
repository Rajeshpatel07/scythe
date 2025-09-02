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
      const havePrefix = /^https?:\/\//.test(url);
      if (!havePrefix) url = `https://${url}`;
      try {
        hostname = new URL(url).hostname;
      } catch (_e) {}
      imgElement.src = `https://favicon.is/${hostname}`;
    }
  });
}
