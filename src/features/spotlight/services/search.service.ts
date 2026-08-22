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
const SEARCH_DEBOUNCE_MS = 150;
let searchVersion = 0;

export function showSpotlight(): void {
  if (
    !config.isSpotlightOpen &&
    !config.isTabOpen &&
    config.isSpotlightEnabled
  ) {
    config.openInNewTab = false;
    config.isSpotlightOpen = true;
    handleWebSearch();
  }
}

export function handleWebSearch(): void {
  createSpotlightUI();
  const root = getHostRoot();
  if (!root) return;

  const searchInput = root.getElementById(
    "spotlight-search-input-ext",
  ) as HTMLInputElement;

  let searchTimeout: ReturnType<typeof setTimeout>;

  searchInput.addEventListener(
    "input",
    () => {
      const query = searchInput.value.trim();

      clearTimeout(searchTimeout);

      if (searchInput.value.length === 0) {
        searchVersion++;
        populateHistory();
        setGhostSuggestion(root, "");
        return;
      }

      if (query.length === 0) return;

      searchTimeout = setTimeout(async () => {
        await searchAndSuggest(query);
      }, SEARCH_DEBOUNCE_MS);
    },
    true,
  );

  populateHistory();
  setGhostSuggestion(root, "");
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

  // One substring query over the full history feeds both the results list
  // (top entries) and the ghost-text completion, so deep paths like
  // github.com/<user> are still suggestable.
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

  if (currentVersion !== searchVersion) return;

  if (!response?.history) {
    resultsList.innerHTML =
      "<li class='spotlight-result-item-ext'>Could not search history. Fetching web suggestions...</li>";
    setGhostSuggestion(root, "");
    return;
  }

  renderResults(resultsList, query, response.history);
  applyGhostSuggestion(root, query, response.history);
}

function renderResults(
  resultsList: HTMLUListElement,
  query: string,
  history: HistoryResponse["history"],
): void {
  resultsList.innerHTML = "";
  if (history.length === 0 && query.length > 0) {
    const li = createListItem({ title: query, url: query, showUrl: false });
    resultsList.appendChild(li);
    return;
  }

  const frag = document.createDocumentFragment();
  history.slice(0, 8).forEach((item) => {
    const li = createListItem({ title: item.title, url: item.url || "" });
    frag.appendChild(li);
  });
  resultsList.appendChild(frag);
}

function setGhostSuggestion(root: ShadowRoot, suggestion: string): void {
  const suggestionEl = root.getElementById(
    "spotlight-suggestion-ext",
  ) as HTMLLIElement;
  suggestionEl.innerText = suggestion;
  config.currentSuggestion = suggestion;
}

function applyGhostSuggestion(
  root: ShadowRoot,
  query: string,
  history: HistoryResponse["history"],
): void {
  const lowerCaseQuery = query.toLowerCase();

  const cached = suggestionCache.get(lowerCaseQuery);
  if (cached !== undefined) {
    setGhostSuggestion(root, cached);
    return;
  }

  let bestScore = -1;
  let bestSuggestion = "";
  const hasPath = lowerCaseQuery.includes("/");

  for (let i = 0; i < history.length; i++) {
    const res = history[i];
    if (!res.url?.startsWith("http")) continue;

    let url: URL;
    try {
      url = new URL(res.url);
    } catch {
      continue;
    }

    // Complete against the authority (host + explicit port) so visited
    // origins like localhost:3000 are suggested as-is; hostname drops ports.
    const authority = url.host.replace(WWW_REGEX, "");
    let candidate = "";
    let matched = false;

    if (hasPath) {
      const fullUrlPath = authority + url.pathname + url.search + url.hash;
      if (fullUrlPath.toLowerCase().startsWith(lowerCaseQuery)) {
        candidate = query + fullUrlPath.slice(query.length);
        matched = true;
      }
    } else if (authority.toLowerCase().startsWith(lowerCaseQuery)) {
      candidate = query + authority.slice(query.length);
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

  setGhostSuggestion(root, bestSuggestion);
  suggestionCache.set(lowerCaseQuery, bestSuggestion);
}
