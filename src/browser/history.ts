import { config } from "../config/config.ts";
import type {
  HistoryItem,
  HistoryResposne,
  StorageResult,
} from "../types/historyTypes";
import { getShadowRoot } from "../utils/dom";
import {
  filterDomainsOnly,
  renderListItems,
  mergeHistory,
} from "../utils/filterHistory.ts";

export async function populateHistory() {
  const shadowRoot = getShadowRoot();
  if (!shadowRoot) return;

  const resultsList = shadowRoot.getElementById(
    "spotlight-results-ext",
  ) as HTMLUListElement;
  config.selectedResultIndex = -1;

  const [storedResult, recentResponse] = await Promise.all([
    chrome.storage.local.get(["storedHistory"]) as Promise<StorageResult>,
    chrome.runtime
      .sendMessage({ action: "getHistory" })
      .catch(() => ({ history: [] })) as Promise<HistoryResposne>,
  ]);

  const storedHistory: HistoryItem[] = storedResult.storedHistory || [];
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
