import { config } from "../../../core/config/config";
import {
  createSpotlightUI,
  hideSpotlight,
} from "../components/spotlight.component";
import { getSpotlightRoot } from "../../../core/utils/dom.utils";
import { populateHistory } from "./history.service";
import { MessageBroker } from "../../../core/messaging/message.broker";
import type { HistoryResponse } from "../../../core/types/domain.types";
import { createListItem } from "../components/result-item.component";
import { resolveUrl } from "../../../core/services/navigation.service";
import { WWW_REGEX } from "../../../core/config/constants";

const suggestionCache = new Map<string, string>();

export function handleWebSearch() {
  createSpotlightUI();
  const root = getSpotlightRoot();
  if (!root) return;

  const searchInput = root.getElementById(
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
      }, 10);

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

  const url = resolveUrl(trimmedInput);

  if (config.openNewtab) {
    hideSpotlight();
    window.open(url);
  } else {
    window.location.href = url;
  }
}

export async function searchAndSuggest(query: string) {
  const root = getSpotlightRoot();
  if (!root) return;

  const resultsList = root.getElementById(
    "spotlight-results-ext",
  ) as HTMLUListElement | null;
  if (!resultsList) return;

  resultsList.innerHTML = "<li>Searching history...</li>";

  let response: HistoryResponse | null = null;
  try {
    response = await MessageBroker.send({ action: "searchHistory", query });
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

export async function updateSuggestion(query: string) {
  const root = getSpotlightRoot();
  if (!root) return;

  const suggestionEl = root.getElementById(
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
    if (cached !== undefined) {
      suggestionEl.innerText = cached;
      config.currentSuggestion = cached;
      return;
    }
  }

  let response: HistoryResponse | null = null;
  try {
    // Fetch a larger pool to ensure highly visited sites aren't buried by recent obscure ones
    response = await MessageBroker.send({
      action: "searchHistory",
      query,
      maxResults: 150,
    });
  } catch {
    response = null;
  }

  const suggestions = response?.history || [];

  // Sort suggestions to prioritize frequently typed and highly visited URLs
  suggestions.sort((a, b) => {
    const aScore = (a.typedCount || 0) * 10 + (a.visitCount || 0);
    const bScore = (b.typedCount || 0) * 10 + (b.visitCount || 0);
    return bScore - aScore;
  });

  let potentialSuggestion = "";
  const hasPath = lowerCaseQuery.includes("/");

  for (const res of suggestions) {
    if (!res.url || !res.url.startsWith("http")) continue;

    let url: URL;
    try {
      url = new URL(res.url);
    } catch {
      continue;
    }

    const host = url.hostname.replace(WWW_REGEX, "");

    if (hasPath) {
      // Retain full path for matching if the user explicitly typed a slash
      const fullUrlPath = host + url.pathname + url.search + url.hash;
      if (fullUrlPath.toLowerCase().startsWith(lowerCaseQuery)) {
        potentialSuggestion = query + fullUrlPath.slice(query.length);
        break;
      }
    } else {
      // Suggest just the naked hostname if no slash is present for cleaner UX
      if (host.toLowerCase().startsWith(lowerCaseQuery)) {
        potentialSuggestion = query + host.slice(query.length);
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
