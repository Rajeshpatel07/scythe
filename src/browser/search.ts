import { config } from "../config";
import { hideSpotlight } from "../ui/model";

export async function handleSearchSubmit(input: string): Promise<void> {
  if (input.length > 0) {
    const isLikelyURL =
      /^(https?:\/\/)?([\w.-]+\.[a-z]{2,})(\/[^\s]*)?$/i.test(input) ||
      /^(?!:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/i.test(input);
    const url = isLikelyURL
      ? input.startsWith("http")
        ? input
        : `https://${input}`
      : await getSearchUrl(input);
    InitiatePageNavigation(url);
  }
}

export function InitiatePageNavigation(url: string): void {
  if (config.openNewtab) {
    hideSpotlight();
    window.open(url);
  } else {
    window.location.href = url;
  }
}

export async function getSearchUrl(input: string): Promise<string> {
  const name = await getStoredSearchEngine();
  if (name === "DuckDuckGo") {
    return `https://duckduckgo.com/?q=${encodeURIComponent(input)}`;
  } else if (name === "Brave") {
    return `https://search.brave.com/search?q=${encodeURIComponent(input)}`;
  } else if (name === "Bing") {
    return `https://www.bing.com/search?q=${encodeURIComponent(input)}`;
  } else if (name === "Unduck") {
    return `https://unduck.link?q=${encodeURIComponent(input)}`;
  } else {
    return `https://www.google.com/search?q=${encodeURIComponent(input)}`;
  }
}

export async function getStoredSearchEngine(): Promise<string> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["searchEngine"], (result) => {
      resolve(result.searchEngine || "Google");
    });
  });
}
