import { createListItem } from "../ui/list";
import { config } from "../config";
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
      "<li>Could not search history. Fetching web suggestions...</li>";
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

export function updateSuggestion(query: string) {
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

  const suggestions = shadowRoot.querySelectorAll(".spotlight-result-item-ext");
  let potentialSuggestion = "";
  for (const result of suggestions) {
    const resultUrl = result.getAttribute("data-url");
    if (!resultUrl) continue;

    let url: URL;
    try {
      url = new URL(resultUrl);
    } catch {
      continue;
    }
    const lowerCaseQuery = query.toLowerCase();
    const hasPath = lowerCaseQuery.includes("/");

    if (hasPath) {
      const fullUrlPath = (
        url.hostname +
        url.pathname +
        url.search +
        url.hash
      ).replace(/^www\./i, "");
      if (fullUrlPath.toLowerCase().startsWith(lowerCaseQuery)) {
        potentialSuggestion = query + fullUrlPath.slice(query.length);
        break;
      }
    } else {
      const hostname = url.hostname.replace(/^www\./i, "");
      if (hostname.toLowerCase().startsWith(lowerCaseQuery)) {
        potentialSuggestion = query + hostname.slice(query.length);
        break;
      }
    }
  }
  if (
    potentialSuggestion &&
    potentialSuggestion.toLowerCase() !== query.toLowerCase()
  ) {
    suggestionEl.innerText = potentialSuggestion;
    config.currentSuggestion = potentialSuggestion;
  } else {
    suggestionEl.innerText = "";
    config.currentSuggestion = "";
  }
}
