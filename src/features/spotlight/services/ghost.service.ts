import { config } from "../../../core/config/config";
import { LruCache } from "../../../core/utils/lru";
import type { SuggestionCandidate } from "./suggestion.engine";
import { pickBestSuggestion } from "./suggestion.engine";
import { getHistoryIndexSync } from "./history-index.store";

const GHOST_CACHE_SIZE = 200;

const suggestionCache = new LruCache<string, string>(GHOST_CACHE_SIZE);

export function setGhostSuggestion(
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

export function clearGhostUnlessPrefix(
  root: ShadowRoot,
  query: string,
): void {
  if (
    config.currentSuggestion?.toLowerCase().startsWith(query.toLowerCase())
  )
    return;
  setGhostSuggestion(root, "", query);
}

function commitGhostSuggestion(
  root: ShadowRoot,
  query: string,
  bestSuggestion: string,
): void {
  if (bestSuggestion) {
    setGhostSuggestion(root, bestSuggestion, query);
    suggestionCache.set(query.toLowerCase(), bestSuggestion);
  } else {
    // A miss must not wipe an instant ghost that is still a valid
    // completion of this query. Empties are deliberately never cached.
    clearGhostUnlessPrefix(root, query);
  }
}

export function updateGhostInstant(query: string, root: ShadowRoot): void {
  const lower = query.toLowerCase();

  const cached = suggestionCache.get(lower);
  if (cached !== undefined) {
    setGhostSuggestion(root, cached, query);
    return;
  }

  const index = getHistoryIndexSync();
  if (!index || index.length === 0) return;

  commitGhostSuggestion(root, query, pickBestSuggestion(query, index));
}

export function applyGhostSuggestion(
  root: ShadowRoot,
  query: string,
  candidates: SuggestionCandidate[],
): void {
  const lower = query.toLowerCase();

  const cached = suggestionCache.get(lower);
  if (cached !== undefined) {
    setGhostSuggestion(root, cached, query);
    return;
  }

  commitGhostSuggestion(root, query, pickBestSuggestion(query, candidates));
}
