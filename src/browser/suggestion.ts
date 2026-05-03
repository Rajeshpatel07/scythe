import { createListItem } from "../ui/list";
import { config } from "../config/config.ts";
import { getShadowRoot } from "../utils/dom";
import type { HistoryResposne } from "../types/historyTypes";

export async function searchAndSuggest(query: string) {
  const shadowRoot = getShadowRoot();
  if (!shadowRoot) return;

  const resultsList = shadowRoot.getElementById(
    "spotlight-results-ext",
  ) as HTMLUListElement | null;
  if (!resultsList) return;

  resultsList.innerHTML = "<li>Searching history...</li>";

  let response: HistoryResposne | null = null;
  try {
    response = (await chrome.runtime.sendMessage({
      action: "searchHistory",
      query,
    })) as HistoryResposne;
  } catch {
    response = null;
  }

  if (!response || !response.history) {
    resultsList.innerHTML =
      "<li class='spotlight-result-item-ext'>Could not search history. Fetching web suggestions...</li>";
    return;
  }

  resultsList.innerHTML = "";
  if (response.history.length === 0 && query.length > 0) {
    const li = createListItem({ title: query, url: query, showUrl: false });
    resultsList.appendChild(li);
    return;
  } else {
    const frag = document.createDocumentFragment();
    response.history.forEach((item) => {
      const li = createListItem({ title: item.title, url: item.url || "" });
      frag.appendChild(li);
    });
    resultsList.appendChild(frag);
  }
}

const suggestionCache = new Map<string, string>();
const WWW_REGEX = /^www\./i;

export async function updateSuggestion(query: string) {
  const shadowRoot = getShadowRoot();
  if (!shadowRoot) return;

  const suggestionEl = shadowRoot.getElementById(
    "spotlight-suggestion-ext",
  ) as HTMLLIElement;

  if (!query) {
    suggestionEl.innerText = "";
    config.currentSuggestion = "";
    return;
  }

  const lowerCaseQuery = query.toLowerCase();

  if (suggestionCache.has(lowerCaseQuery)) {
    const cached = suggestionCache.get(lowerCaseQuery);
    if (cached) {
      suggestionEl.innerText = cached;
      config.currentSuggestion = cached;
      return;
    }
  }

  let response: HistoryResposne | null = null;
  try {
    response = (await chrome.runtime.sendMessage({
      action: "searchHistory",
      query,
      maxResults: 50,
    })) as HistoryResposne;
  } catch {
    response = null;
  }

  const suggestions = response?.history || [];
  let potentialSuggestion = "";
  const hasPath = lowerCaseQuery.includes("/");

  for (const res of suggestions) {
    if (!res.url) continue;

    let url: URL;
    try {
      url = new URL(res.url);
    } catch {
      continue;
    }

    if (hasPath) {
      const fullUrlPath = (
        url.hostname +
        url.pathname +
        url.search +
        url.hash
      ).replace(WWW_REGEX, "");
      if (fullUrlPath.toLowerCase().startsWith(lowerCaseQuery)) {
        potentialSuggestion = query + fullUrlPath.slice(query.length);
        break;
      }
    } else {
      const hostname = url.hostname.replace(WWW_REGEX, "");
      if (hostname.toLowerCase().startsWith(lowerCaseQuery)) {
        potentialSuggestion = query + hostname.slice(query.length);
        break;
      }
    }
  }

  if (
    potentialSuggestion &&
    potentialSuggestion.toLowerCase() !== lowerCaseQuery
  ) {
    suggestionEl.innerText = potentialSuggestion;
    config.currentSuggestion = potentialSuggestion;
    suggestionCache.set(lowerCaseQuery, potentialSuggestion);
  } else {
    suggestionEl.innerText = "";
    config.currentSuggestion = "";
    suggestionCache.set(lowerCaseQuery, "");
  }
}
