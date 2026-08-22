import { config } from "../../../core/config/config";
import {
  createSpotlightUI,
  hideSpotlight,
} from "../components/spotlight.component";
import { getHostRoot } from "../../../core/utils/host.utils";
import { populateHistory } from "./history.spotlight.service";
import { MessageBroker } from "../../../core/messaging/message.broker";
import type { HistoryResponse } from "../../../core/types/domain.types";
import { createListItem } from "../components/result-item.component";
import { resolveUrl, openUrl } from "../../../core/services/navigation.service";
import { WWW_REGEX } from "../../../core/config/constants";
import { LruCache } from "../../../core/utils/lru";

const suggestionCache = new LruCache<string, string>(200);
let searchVersion = 0;
let suggestVersion = 0;

export function handleWebSearch(): void {
  createSpotlightUI();
  const root = getHostRoot();
  if (!root) return;

  const searchInput = root.getElementById(
    "spotlight-search-input-ext",
  ) as HTMLInputElement;

  let searchTimeout: ReturnType<typeof setTimeout>;
  let suggestTimeout: ReturnType<typeof setTimeout>;

  searchInput.addEventListener(
    "input",
    () => {
      const query = searchInput.value.trim();

      clearTimeout(searchTimeout);
      clearTimeout(suggestTimeout);

      if (searchInput.value.length === 0) {
        searchVersion++;
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
  hideSpotlight();
  openUrl(url, config.openInNewTab);
}

async function searchAndSuggest(query: string): Promise<void> {
  searchVersion++;
  const currentVersion = searchVersion;

  const root = getHostRoot();
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

  if (currentVersion !== searchVersion) return;

  if (!response?.history) {
    resultsList.innerHTML =
      "<li class='spotlight-result-item-ext'>Could not search history. Fetching web suggestions...</li>";
    return;
  }

  if (currentVersion !== searchVersion) return;

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

async function updateSuggestion(query: string): Promise<void> {
  suggestVersion++;
  const currentVersion = suggestVersion;

  const root = getHostRoot();
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

  const cached = suggestionCache.get(lowerCaseQuery);
  if (cached !== undefined) {
    suggestionEl.innerText = cached;
    config.currentSuggestion = cached;
    return;
  }

  let response: HistoryResponse | null = null;
  try {
    response = await MessageBroker.send({
      action: "searchHistory",
      query,
      maxResults: 150,
    });
  } catch {
    response = null;
  }

  if (currentVersion !== suggestVersion) return;

  const suggestions = response?.history || [];

  let bestScore = -1;
  let bestSuggestion = "";
  const hasPath = lowerCaseQuery.includes("/");

  for (let i = 0; i < suggestions.length; i++) {
    const res = suggestions[i];
    if (!res.url?.startsWith("http")) continue;

    let url: URL;
    try {
      url = new URL(res.url);
    } catch {
      continue;
    }

    const host = url.hostname.replace(WWW_REGEX, "");
    let candidate = "";
    let matched = false;

    if (hasPath) {
      const fullUrlPath = host + url.pathname + url.search + url.hash;
      if (fullUrlPath.toLowerCase().startsWith(lowerCaseQuery)) {
        candidate = query + fullUrlPath.slice(query.length);
        matched = true;
      }
    } else if (host.toLowerCase().startsWith(lowerCaseQuery)) {
      candidate = query + host.slice(query.length);
      matched = true;
    }

    if (!matched) continue;
    if (candidate.toLowerCase() === lowerCaseQuery) continue;

    const score = (res.typedCount || 0) * 10 + (res.visitCount || 0);
    if (score > bestScore) {
      bestScore = score;
      bestSuggestion = candidate;
    }
  }

  if (bestSuggestion) {
    suggestionEl.innerText = bestSuggestion;
    config.currentSuggestion = bestSuggestion;
    suggestionCache.set(lowerCaseQuery, bestSuggestion);
  } else {
    suggestionEl.innerText = "";
    config.currentSuggestion = "";
    suggestionCache.set(lowerCaseQuery, "");
  }
}
