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

export async function populateHistory(): Promise<void> {
  const root = getHostRoot();
  if (!root) return;

  const resultsList = root.getElementById(
    "spotlight-results-ext",
  ) as HTMLUListElement;
  config.selectedResultIndex = -1;

  const storedHistory = await getStoredHistory();

  const needsFullFetch = storedHistory.length < 8;
  const freshPromise = MessageBroker.send({
    action: "getHistory",
    ...(needsFullFetch ? { maxResults: 150 } : {}),
  }).catch(() => ({ history: [] })) as Promise<HistoryResponse>;

  if (storedHistory.length > 0) {
    renderListItems(storedHistory.slice(0, 8), resultsList);
  }

  const recentResponse = await freshPromise;
  const recentItems = recentResponse?.history || [];

  if (recentItems.length === 0 && storedHistory.length === 0) {
    resultsList.innerHTML = "<li>No recent history.</li>";
    return;
  }

  const filteredFresh = recentItems.filter((item) =>
    filterDomainsOnly(item.url),
  );

  const merged = mergeHistory(storedHistory, filteredFresh);
  const finalHistory = merged.slice(0, 8);

  renderListItems(finalHistory, resultsList);

  const cacheToStore = merged.length > 50 ? merged.slice(0, 50) : merged;
  storage.local.set({ storedHistory: cacheToStore });
}
