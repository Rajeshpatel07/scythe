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
import {
  EMPTY_HISTORY_HTML,
  NO_SELECTION,
  PERSISTED_HISTORY,
  SEARCH_MAX_RESULTS,
  SPOTLIGHT_IDS,
  VISIBLE_RESULTS,
} from "../spotlight.constants";

let historyVersion = 0;

export async function populateHistory(): Promise<void> {
  historyVersion++;
  const currentVersion = historyVersion;

  const root = getHostRoot();
  if (!root) return;

  const resultsList = root.getElementById(
    SPOTLIGHT_IDS.resultsList,
  ) as HTMLUListElement | null;
  if (!resultsList) return;
  config.selectedResultIndex = NO_SELECTION;

  const stored = await getStoredHistory();
  if (currentVersion !== historyVersion) return;

  if (stored.length > 0) {
    renderListItems(stored.slice(0, VISIBLE_RESULTS), resultsList);
  }

  const needsFullFetch = stored.length < VISIBLE_RESULTS;
  let recent: HistoryResponse | null = null;
  try {
    recent = await MessageBroker.send({
      action: "getHistory",
      ...(needsFullFetch ? { maxResults: SEARCH_MAX_RESULTS } : {}),
    });
  } catch {
    recent = null;
  }

  if (currentVersion !== historyVersion) return;

  const recentItems = recent?.history || [];

  if (recentItems.length === 0 && stored.length === 0) {
    resultsList.innerHTML = EMPTY_HISTORY_HTML;
    return;
  }

  const filteredFresh = recentItems.filter((item) =>
    filterDomainsOnly(item.url),
  );

  const merged = mergeHistory(stored, filteredFresh);

  renderListItems(merged.slice(0, VISIBLE_RESULTS), resultsList);

  const cacheToStore =
    merged.length > PERSISTED_HISTORY
      ? merged.slice(0, PERSISTED_HISTORY)
      : merged;
  if (JSON.stringify(cacheToStore) !== JSON.stringify(stored)) {
    storage.local.set({ storedHistory: cacheToStore }).catch(() => {});
  }
}
