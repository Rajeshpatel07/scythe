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
import { WWW_REGEX } from "../../../core/config/constants";
import type { HistoryItem } from "../../../core/types/domain.types";

let historyVersion = 0;

const HISTORY_SNAPSHOT_SIZE = 1000;

interface ParsedHistoryEntry {
  raw: HistoryItem;
  authority: string;
  authorityLower: string;
  fullPath: string;
  fullPathLower: string;
}

let historyIndex: ParsedHistoryEntry[] | null = null;
let historyIndexPromise: Promise<ParsedHistoryEntry[]> | null = null;

export function getHistoryIndexSync(): ParsedHistoryEntry[] | null {
  return historyIndex;
}

export async function ensureHistoryIndex(): Promise<ParsedHistoryEntry[]> {
  if (historyIndex) return historyIndex;
  if (historyIndexPromise) return historyIndexPromise;

  historyIndexPromise = (async () => {
    let items: HistoryItem[] = [];
    try {
      const res = await MessageBroker.send({
        action: "getHistory",
        maxResults: HISTORY_SNAPSHOT_SIZE,
      });
      items = res?.history ?? [];
    } catch {
      items = [];
    }

    try {
      const stored = await getStoredHistory();
      if (stored.length > 0) {
        const seen = new Set(items.map((entry) => entry.url));
        const extra = stored.filter(
          (entry) => entry.url && !seen.has(entry.url),
        );
        if (extra.length > 0) items = [...items, ...extra];
      }
    } catch {
      // best-effort merge
    }

    const parsed: ParsedHistoryEntry[] = [];
    for (const item of items) {
      if (!item.url?.startsWith("http")) continue;
      try {
        const url = new URL(item.url);
        const authority = url.host.replace(WWW_REGEX, "");
        const fullPath = authority + url.pathname + url.search + url.hash;
        parsed.push({
          raw: item,
          authority,
          authorityLower: authority.toLowerCase(),
          fullPath,
          fullPathLower: fullPath.toLowerCase(),
        });
      } catch {
      }
    }

    historyIndex = parsed;
    return parsed;
  })();

  const result = await historyIndexPromise;
  historyIndexPromise = null;
  return result;
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
    return;
  }

  const filteredFresh = recentItems.filter((item) =>
    filterDomainsOnly(item.url),
  );

  const merged = mergeHistory(stored, filteredFresh);

  renderListItems(merged.slice(0, 8), resultsList);

  const cacheToStore = merged.length > 50 ? merged.slice(0, 50) : merged;
  if (JSON.stringify(cacheToStore) !== JSON.stringify(stored)) {
    storage.local.set({ storedHistory: cacheToStore }).catch(() => {});
  }
}
