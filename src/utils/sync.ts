import type { HistoryItem } from "../types/historyTypes";
import { createListItem } from "../ui/list";

export function filterDomainsOnly(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.pathname === "/" && !parsed.search && !parsed.hash;
  } catch {
    return false;
  }
}

export async function getStoredHistory(): Promise<HistoryItem[]> {
  const result = await chrome.storage.sync.get(["storedHistory"]);
  return result.storedHistory;
}

export function mergeHistory(
  stored: HistoryItem[],
  recent: HistoryItem[],
): HistoryItem[] {
  const recentUrls = new Set(recent.map((item) => item.url));
  const filtered = stored.filter((item) => !recentUrls.has(item.url));
  return [...recent, ...filtered];
}

export function renderListItems(
  items: HistoryItem[],
  resultList: HTMLUListElement,
) {
  items.forEach((item) => {
    const li = createListItem(item.title || item.url, item.url);
    resultList.appendChild(li);
  });
}
