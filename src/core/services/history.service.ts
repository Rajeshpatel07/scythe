import type { HistoryItem } from "../types/domain.types";

export function filterDomainsOnly(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.pathname === "/" && !parsed.search && !parsed.hash;
  } catch {
    return false;
  }
}

export async function getStoredHistory(): Promise<HistoryItem[]> {
  const result = await chrome.storage.sync.get<{
    storedHistory?: HistoryItem[];
  }>(["storedHistory"]);
  return result.storedHistory || [];
}

export function mergeHistory(
  stored: HistoryItem[],
  recent: HistoryItem[],
): HistoryItem[] {
  const recentUrls = new Set(recent.map((item) => item.url));
  const filtered = stored.filter((item) => !recentUrls.has(item.url));
  return [...recent, ...filtered];
}
