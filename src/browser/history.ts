import { createListItem } from "../ui/list";
import { config } from "../config";

type HistoryItem = {
  id: string;
  lastVisitTime: Date;
  title: string;
  typedCount: number;
  url: string;
  visitCount: number;
};

export function populateHistory() {
  const shadowHost = document.getElementById("spotlight-host");
  const shadowRoot = shadowHost?.shadowRoot;
  if (!shadowRoot) return;

  const resultsList = shadowRoot.getElementById(
    "spotlight-results-ext",
  ) as HTMLUListElement;
  resultsList.innerHTML = "<li>Loading recent history...</li>";
  config.selectedResultIndex = -1;

  chrome.runtime.sendMessage({ action: "getHistory" }, async (response) => {
    if (!response?.history) {
      resultsList.innerHTML = "<li>Could not load history.</li>";
      return;
    }

    resultsList.innerHTML = "";
    if (response.history.length === 0) {
      resultsList.innerHTML = "<li>No recent history.</li>";
      return;
    }

    const recent = response.history.filter((item: HistoryItem) =>
      filterDomainsOnly(item.url),
    );

    if (recent.length >= 8) {
      renderListItems(recent.slice(0, 8), resultsList);
      return;
    }

    const stored = await getStoredHistory();
    if (stored) {
      const merged = mergeHistory(stored, recent).slice(0, 8);
      renderListItems(merged, resultsList);
      chrome.storage.sync.set({ storedHistory: merged });
    } else {
      renderListItems(recent.slice(0, 8), resultsList);
      chrome.storage.sync.set({ storedHistory: recent });
    }
  });
}

function filterDomainsOnly(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.pathname === "/" && !parsed.search && !parsed.hash;
  } catch {
    return false;
  }
}

async function getStoredHistory(): Promise<HistoryItem[]> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["storedHistory"], (result) => {
      resolve(result.storedHistory);
    });
  });
}

function mergeHistory(
  stored: HistoryItem[],
  recent: HistoryItem[],
): HistoryItem[] {
  const recentUrls = new Set(recent.map((item) => item.url));
  const filtered = stored.filter((item) => !recentUrls.has(item.url));
  return [...recent, ...filtered];
}

function renderListItems(items: HistoryItem[], resultList: HTMLUListElement) {
  items.forEach((item) => {
    const li = createListItem(item.title || item.url, item.url);
    resultList.appendChild(li);
  });
}
