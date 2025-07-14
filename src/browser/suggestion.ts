import { createListItem } from "../ui/list";
import { config } from "../config";

export function searchAndSuggest(query: string) {
  const resultsList = document.getElementById(
    "spotlight-results-ext",
  ) as HTMLUListElement;
  resultsList.innerHTML = "<li>Searching history...</li>"; // Initial message
  // selectedResultIndex = -1; // Reset selection

  // 1. Search browser history first
  chrome.runtime.sendMessage(
    { action: "searchHistory", query: query },
    (response) => {
      if (response?.history) {
        resultsList.innerHTML = ""; // Clear placeholder
        if (response.history.length > 0) {
          // @ts-ignore
          response.history.slice(0, 5).forEach((item) => {
            const li = createListItem(item.title || item.url, item.url);
            resultsList.appendChild(li);
          });
        }

        if (response.history.length < 5 || response.history.length === 0) {
          if (response.history.length === 0 && query.length > 0) {
            const li = createListItem(query, "");
            resultsList.appendChild(li);
            return;
          }
          fetchSuggestions(query, response.history.length); // Pass history count
        }
      } else {
        resultsList.innerHTML =
          "<li>Could not search history. Fetching web suggestions...</li>";
        fetchSuggestions(query, 0); // Fallback to API if history search fails
      }
    },
  );
}

function fetchSuggestions(query: string, historyCount = 0) {
  const resultsList = document.getElementById(
    "spotlight-results-ext",
  ) as HTMLUListElement;

  if (historyCount === 0) {
    resultsList.innerHTML = "";
    createListItem(
      query,
      "https://api.iconify.design/iconamoon:search-light.svg",
    );
  }
}

export function updateSuggestion(query: string) {
  const suggestionEl = document.getElementById(
    "spotlight-suggestion-ext",
  ) as HTMLLIElement;
  //@ts-ignore
  if (!query) {
    suggestionEl.innerText = "";
    config.currentSuggestion = "";
    return;
  }

  const firstResult = document.querySelector(".spotlight-result-item-ext");
  if (firstResult) {
    let potentialSuggestion = "";
    const resultUrl = firstResult.getAttribute("data-url");

    // matching against URL hostname for autocompletion
    try {
      if (resultUrl) {
        const hostname = new URL(resultUrl).hostname.replace("www.", "");
        if (hostname.toLowerCase().startsWith(query.toLowerCase())) {
          potentialSuggestion = query + hostname.slice(query.length);
        }
      }
    } catch (_e) {
      /* ignore invalid URLs */
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
  } else {
    suggestionEl.innerText = "";
    config.currentSuggestion = "";
  }
}
