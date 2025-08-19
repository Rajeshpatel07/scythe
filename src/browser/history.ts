import { config } from "../config";
import type { HistoryResposne } from "../types/historyTypes";
import {
  filterDomainsOnly,
  renderListItems,
  mergeHistory,
  getStoredHistory,
} from "../utils/sync";

export async function populateHistory() {
  const shadowHost = document.getElementById("spotlight-host");
  const shadowRoot = shadowHost?.shadowRoot;
  if (!shadowRoot) return;

  const resultsList = shadowRoot.getElementById(
    "spotlight-results-ext",
  ) as HTMLUListElement;

  resultsList.innerHTML = "<li>Loading recent history...</li>";
  config.selectedResultIndex = -1;

  const response: HistoryResposne = await chrome.runtime.sendMessage({
    action: "getHistory",
  });

  if (!response.history) {
    resultsList.innerHTML = "<li>Could not load history.</li>";
    return;
  }

  resultsList.innerHTML = "";
  if (response.history.length === 0) {
    resultsList.innerHTML = "<li>No recent history.</li>";
    return;
  }

  const recentHistory = response.history.filter((item) =>
    filterDomainsOnly(item.url),
  );

  if (recentHistory.length >= 8) {
    renderListItems(recentHistory.slice(0, 8), resultsList);
    chrome.storage.sync.set({ storedHistory: recentHistory });
    return;
  }

  const storedHistory = await getStoredHistory();

  const finalHistory = storedHistory
    ? mergeHistory(storedHistory, recentHistory).slice(0, 8)
    : recentHistory.slice(0, 8);

  renderListItems(finalHistory, resultsList);
  chrome.storage.sync.set({ storedHistory: finalHistory });
}
