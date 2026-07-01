import { config } from "../../../core/config/config";
import type { HistoryResponse } from "../../../core/types/domain.types";
import { getSpotlightRoot } from "../../../core/utils/dom.utils";
import {
  filterDomainsOnly,
  mergeHistory,
  getStoredHistory,
} from "../../../core/services/history.service";
import { MessageBroker } from "../../../core/messaging/message.broker";
import { renderListItems } from "../components/result-item.component";

export async function populateHistory() {
  const root = getSpotlightRoot();
  if (!root) return;

  const resultsList = root.getElementById(
    "spotlight-results-ext",
  ) as HTMLUListElement;
  config.selectedResultIndex = -1;

  const [storedHistory, recentResponse] = await Promise.all([
    getStoredHistory(),
    MessageBroker.send({ action: "getHistory" }).catch(() => ({
      history: [],
    })) as Promise<HistoryResponse>,
  ]);

  const recentItems = recentResponse?.history || [];

  if (recentItems.length === 0 && storedHistory.length === 0) {
    resultsList.innerHTML = "<li>No recent history.</li>";
    return;
  }

  const recentHistory = recentItems.filter((item) =>
    filterDomainsOnly(item.url),
  );

  let finalHistory = recentHistory;
  if (recentHistory.length < 8) {
    finalHistory = mergeHistory(storedHistory, recentHistory).slice(0, 8);
  } else {
    finalHistory = recentHistory.slice(0, 8);
  }

  renderListItems(finalHistory, resultsList);

  const isSame = JSON.stringify(storedHistory) === JSON.stringify(finalHistory);
  if (!isSame) {
    chrome.storage.local.set({ storedHistory: finalHistory });
  }
}
