import { config } from "../../../core/config/config";
import type { HistoryResponse } from "../../../core/types/domain.types";
import { getHostRoot } from "../../../core/utils/host.utils";
import {
  filterDomainsOnly,
  mergeHistory,
  getStoredHistory,
} from "../../../core/services/history.service";
import { storage } from "../../../core/storage/storage.utils";
import { MessageBroker } from "../../../core/messaging/message.broker";
import { renderListItems } from "../components/result-item.component";
import type { HistoryItem } from "../../../core/types/domain.types";

let historyVersion = 0;

// Fetched once per spotlight session and reused by keystroke-time suggestion
// scoring so typing never triggers extra messaging round-trips.
let recentHistoryCache: HistoryItem[] | null = null;

export function getRecentHistorySnapshot(): HistoryItem[] {
  return recentHistoryCache ?? [];
}

export async function populateHistory(): Promise<void> {
  historyVersion++;
  const currentVersion = historyVersion;

  const root = getHostRoot();
  if (!root) return;

  const resultsList = root.getElementById(
    "spotlight-results-ext",
  ) as HTMLUListElement;
  config.selectedResultIndex = -1;

  recentHistoryCache = null;
  const stored = await getStoredHistory();

  if (stored.length > 0) {
    renderListItems(stored.slice(0, 8), resultsList);
  }

  const needsFullFetch = stored.length < 8;
  let recent: HistoryResponse | null = null;
  try {
    recent = await MessageBroker.send({
      action: "getHistory",
      ...(needsFullFetch ? { maxResults: 150 } : {}),
    });
  } catch {
    recent = null;
  }

  if (currentVersion !== historyVersion) return;

  const recentItems = recent?.history || [];

  if (recentItems.length === 0 && stored.length === 0) {
    resultsList.innerHTML = "<li>No recent history.</li>";
    recentHistoryCache = [];
    return;
  }

  const filteredFresh = recentItems.filter((item) =>
    filterDomainsOnly(item.url),
  );

  const merged = mergeHistory(stored, filteredFresh);
  recentHistoryCache = merged;

  renderListItems(merged.slice(0, 8), resultsList);

  const cacheToStore = merged.length > 50 ? merged.slice(0, 50) : merged;
  if (JSON.stringify(cacheToStore) !== JSON.stringify(stored)) {
    storage.local.set({ storedHistory: cacheToStore }).catch(() => {});
  }
}
