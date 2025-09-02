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
  const history = response.history;
  if (history.length === 0 && query.length > 0) {
    const li = createListItem(query, query);
    resultsList.appendChild(li);
    return;
  } else {
    const frag = document.createDocumentFragment();
    history.forEach((item) => {
      const li = createListItem(item.title, item.url || "");
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
  for (const firstResult of suggestions) {
    if (firstResult) {
      const resultUrl = firstResult.getAttribute("data-url");

      if (resultUrl) {
        let url: URL;
        try {
          url = new URL(resultUrl);
        } catch {
          return null;
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
          }
        } else {
          const hostname = url.hostname.replace(/^www\./i, "");
          if (hostname.toLowerCase().startsWith(lowerCaseQuery)) {
            potentialSuggestion = query + hostname.slice(query.length);
          }
        }
      }
    } else {
      suggestionEl.innerText = "";
      config.currentSuggestion = "";
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
