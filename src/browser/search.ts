import { config } from "../config/config.ts";
import { createModelUI, hideSpotlight } from "../ui/model";
import { getShadowRoot } from "../utils/dom.ts";
import { populateHistory } from "./history.ts";
import { searchAndSuggest, updateSuggestion } from "./suggestion.ts";

const LOCALHOST_REGEX = /^(https?:\/\/)?localhost:\d+(\/.*)?(\?.*)?(#.*)?$/i;
const LIKELY_URL_REGEX = /^(https?:\/\/)?([\w.-]+\.[a-z]{2,})(\/[^ ]*)?$/i;
const IP_URL_REGEX = /^(?!:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^ ]*)?$/i;
const HAS_PROTOCOL_REGEX = /^https?:\/\//i;

export function handleWebSearch() {
  createModelUI();
  const shadowRoot = getShadowRoot();
  if (!shadowRoot) return;

  const searchInput = shadowRoot.getElementById(
    "spotlight-search-input-ext",
  ) as HTMLInputElement;

  let searchTimeout: NodeJS.Timeout;
  let suggestTimeout: NodeJS.Timeout;

  searchInput.addEventListener(
    "input",
    () => {
      const query = searchInput.value.trim();

      clearTimeout(searchTimeout);
      clearTimeout(suggestTimeout);

      if (searchInput.value.length === 0) {
        populateHistory();
        updateSuggestion("");
        return;
      }

      if (query.length === 0) return;

      suggestTimeout = setTimeout(() => {
        updateSuggestion(query);
      }, 20);

      searchTimeout = setTimeout(async () => {
        await searchAndSuggest(query);
      }, 100);
    },
    true,
  );

  populateHistory();
  updateSuggestion("");
}

export function handleSearchSubmit(input: string): void {
  const trimmedInput = input.trim();
  if (trimmedInput.length === 0) return;

  let url = trimmedInput;
  const hasProtocol = HAS_PROTOCOL_REGEX.test(trimmedInput);

  if (LOCALHOST_REGEX.test(trimmedInput)) {
    url = hasProtocol ? trimmedInput : `http://${trimmedInput}`;
  } else if (
    LIKELY_URL_REGEX.test(trimmedInput) ||
    IP_URL_REGEX.test(trimmedInput)
  ) {
    url = hasProtocol ? trimmedInput : `https://${trimmedInput}`;
  } else {
    url = getSearchUrl(trimmedInput);
  }

  InitiatePageNavigation(url);
}

export function InitiatePageNavigation(url: string): void {
  if (config.openNewtab) {
    hideSpotlight();
    window.open(url);
  } else {
    window.location.href = url;
  }
}

export function getSearchUrl(input: string): string {
  const encodedInput = encodeURIComponent(input);

  switch (config.searchEngine) {
    case "DuckDuckGo":
      return `https://duckduckgo.com/?q=${encodedInput}`;
    case "Brave":
      return `https://search.brave.com/search?q=${encodedInput}`;
    case "Bing":
      return `https://www.bing.com/search?q=${encodedInput}`;
    case "Unduck":
      return `https://unduck.link?q=${encodedInput}`;
    default:
      return `https://www.google.com/search?q=${encodedInput}`;
  }
}
