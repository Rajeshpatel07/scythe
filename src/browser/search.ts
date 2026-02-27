import { config } from "../config/config.ts";
import { createModelUI, hideSpotlight } from "../ui/model";
import { getShadowRoot } from "../utils/dom.ts";
import { populateHistory } from "./history.ts";
import { searchAndSuggest, updateSuggestion } from "./suggestion.ts";

export function handleWebSearch() {
  createModelUI();

  const shadowRoot = getShadowRoot();

  if (!shadowRoot) return;

  const searchInput = shadowRoot.getElementById(
    "spotlight-search-input-ext"
  ) as HTMLInputElement;

  let debounceTimeout: NodeJS.Timeout;
  searchInput.addEventListener(
    "input",
    () => {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(async () => {
        const query = searchInput.value.trim();
        if (query.length > 0) {
          await searchAndSuggest(query);
        } else if (searchInput.value.length === 0) {
          populateHistory();
        }
        updateSuggestion(query);
      }, 100);
    },
    true
  );

  populateHistory();
  updateSuggestion("");
}

export async function handleSearchSubmit(input: string): Promise<void> {
  if (input.length > 0) {
    const isLocalHost = /^(https?:\/\/)?localhost:\d+(\/.*)?(\?.*)?(#.*)?$/i.test(
      input
    );

    const isLikelyURL =
      /^(https?:\/\/)?([\w.-]+\.[a-z]{2,})(\/[^ ]*)?$/i.test(input) ||
      /^(?!:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^ ]*)?$/i.test(input);

    const url = isLocalHost
      ? input.startsWith("http://") || input.startsWith("https://")
        ? input
        : `http://${input}`
      : isLikelyURL
      ? input.startsWith("http://") || input.startsWith("https://")
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
  return new Promise(resolve => {
    chrome.storage.sync.get(["searchEngine"], result => {
      resolve(result.searchEngine || "Google");
    });
  });
}
