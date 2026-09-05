import { config } from "../../../core/config/config";
import {
  createSpotlightUI,
  hideSpotlight,
} from "../components/spotlight.component";
import { getHostRoot } from "../../../core/utils/host.utils";
import {
  populateHistory,
  ensureHistoryIndex,
  getHistoryIndexSync,
} from "./history.spotlight.service";
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

  void ensureHistoryIndex();

  const searchInput = root.getElementById(
    "spotlight-search-input-ext",
  ) as HTMLInputElement | null;
  if (!searchInput) return;

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

      // Instant feedback from the local index (0ms) keeps typing feeling
      // snappy; the debounced history query refines it with the full index.
      updateGhostInstant(query, root);

      searchTimeout = setTimeout(async () => {
        await searchAndSuggest(query);
      }, SEARCH_DEBOUNCE_MS);
    },
    true,
  );

  populateHistory();
  setGhostSuggestion(root, "");
}

function updateGhostInstant(query: string, root: ShadowRoot): void {
  const lower = query.toLowerCase();

  const cached = suggestionCache.get(lower);
  if (cached !== undefined) {
    setGhostSuggestion(root, cached, query);
    return;
  }

  const index = getHistoryIndexSync();
  if (!index || index.length === 0) return;

  const hasPath = lower.includes("/");
  let bestScore = -1;
  let bestSuggestion = "";

  for (const entry of index) {
    let matched = false;
    let candidate = "";

    if (hasPath) {
      if (entry.fullPathLower.startsWith(lower)) {
        candidate = query + entry.fullPath.slice(query.length);
        matched = true;
      }
    } else if (entry.authorityLower.startsWith(lower)) {
      candidate = query + entry.authority.slice(query.length);
      matched = true;
    }

    if (!matched) continue;
    if (candidate.toLowerCase() === lower) continue;

    const score =
      (entry.raw.typedCount || 0) * 10 + (entry.raw.visitCount || 0);
    if (score > bestScore) {
      bestScore = score;
      bestSuggestion = candidate;
    }
  }

  if (bestSuggestion) {
    suggestionCache.set(lower, bestSuggestion);
    setGhostSuggestion(root, bestSuggestion, query);
  } else {
    clearGhostUnlessPrefix(root, query);
  }
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
    response = await MessageBroker.send({
      action: "searchHistory",
      query,
      maxResults: 150,
    });
  } catch {
    response = null;
  }

  if (currentVersion !== searchVersion) return;

  // The input may have moved on while the query was in flight; a newer
  // debounced search will cover it, so never paint stale results or ghosts.
  const liveInput =
    (
      root.getElementById(
        "spotlight-search-input-ext",
      ) as HTMLInputElement | null
    )?.value.trim() ?? query;
  if (liveInput !== query) return;

  if (!response?.history) {
    resultsList.innerHTML =
      "<li class='spotlight-result-item-ext'>Could not search history. Fetching web suggestions...</li>";
    clearGhostUnlessPrefix(root, query);
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

function setGhostSuggestion(
  root: ShadowRoot,
  suggestion: string,
  query?: string,
): void {
  const suggestionEl = root.getElementById(
    "spotlight-suggestion-ext",
  ) as HTMLLIElement | null;
  if (!suggestionEl) return;

  let next = suggestion || "";
  const q = (query ?? "").toLowerCase();
  if (next && q) {
    const nextLower = next.toLowerCase();
    if (!nextLower.startsWith(q) || nextLower === q) next = "";
  }

  if (
    config.currentSuggestion === next &&
    suggestionEl.innerText === next
  ) {
    return;
  }

  suggestionEl.innerText = next;
  config.currentSuggestion = next;
}

function clearGhostUnlessPrefix(root: ShadowRoot, query: string): void {
  if (
    config.currentSuggestion?.toLowerCase().startsWith(query.toLowerCase())
  )
    return;
  setGhostSuggestion(root, "", query);
}

function applyGhostSuggestion(
  root: ShadowRoot,
  query: string,
  history: HistoryResponse["history"],
): void {
  const lowerCaseQuery = query.toLowerCase();

  const cached = suggestionCache.get(lowerCaseQuery);
  if (cached !== undefined) {
    setGhostSuggestion(root, cached, query);
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

  if (bestSuggestion) {
    setGhostSuggestion(root, bestSuggestion, query);
    suggestionCache.set(lowerCaseQuery, bestSuggestion);
  } else {
    // A debounced miss must not wipe the instant ghost shown above when
    // that ghost is still a valid completion of this query. Empties are
    // deliberately never cached.
    clearGhostUnlessPrefix(root, query);
  }
}
