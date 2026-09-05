import { config } from "../../../core/config/config";
import { LruCache } from "../../../core/utils/lru";
import type { AutocompletionCandidate } from "./autocompletion.engine";
import { pickBestAutocompletion } from "./autocompletion.engine";
import { getHistoryIndexSync } from "./history-index.store";
import { SPOTLIGHT_IDS } from "../spotlight.constants";

const AUTOCOMPLETION_CACHE_SIZE = 200;

const autocompletionCache = new LruCache<string, string>(
  AUTOCOMPLETION_CACHE_SIZE,
);

export function setAutocompletion(
  root: ShadowRoot,
  autocompletion: string,
  query?: string,
): void {
  const autocompletionEl = root.getElementById(
    SPOTLIGHT_IDS.suggestion,
  ) as HTMLLIElement | null;
  if (!autocompletionEl) return;

  let next = autocompletion || "";
  const q = (query ?? "").toLowerCase();
  if (next && q) {
    const nextLower = next.toLowerCase();
    if (!nextLower.startsWith(q) || nextLower === q) next = "";
  }

  if (
    config.currentAutocompletion === next &&
    autocompletionEl.innerText === next
  ) {
    return;
  }

  autocompletionEl.innerText = next;
  config.currentAutocompletion = next;
}

export function clearAutocompletionUnlessPrefix(
  root: ShadowRoot,
  query: string,
): void {
  if (
    config.currentAutocompletion?.toLowerCase().startsWith(query.toLowerCase())
  )
    return;
  setAutocompletion(root, "", query);
}

function commitAutocompletion(
  root: ShadowRoot,
  query: string,
  bestAutocompletion: string,
): void {
  if (bestAutocompletion) {
    setAutocompletion(root, bestAutocompletion, query);
    autocompletionCache.set(query.toLowerCase(), bestAutocompletion);
  } else {
    // A miss must not wipe an instant autocompletion that is still a valid
    // completion of this query. Empties are deliberately never cached.
    clearAutocompletionUnlessPrefix(root, query);
  }
}

export function updateAutocompletionInstant(
  query: string,
  root: ShadowRoot,
): void {
  const lower = query.toLowerCase();

  const cached = autocompletionCache.get(lower);
  if (cached !== undefined) {
    setAutocompletion(root, cached, query);
    return;
  }

  const index = getHistoryIndexSync();
  if (!index || index.length === 0) return;

  commitAutocompletion(root, query, pickBestAutocompletion(query, index));
}

export function applyAutocompletion(
  root: ShadowRoot,
  query: string,
  candidates: AutocompletionCandidate[],
): void {
  const lower = query.toLowerCase();

  const cached = autocompletionCache.get(lower);
  if (cached !== undefined) {
    setAutocompletion(root, cached, query);
    return;
  }

  commitAutocompletion(root, query, pickBestAutocompletion(query, candidates));
}
