import { MessageBroker } from "../../../core/messaging/message.broker";
import { getStoredHistory } from "../../../core/services/history.service";
import type { HistoryItem } from "../../../core/types/domain.types";
import type { AutocompletionCandidate } from "./autocompletion.engine";
import { parseHistoryEntry } from "./autocompletion.engine";
import { HISTORY_SNAPSHOT_SIZE } from "../spotlight.constants";

const HISTORY_INDEX_TTL_MS = 5 * 60 * 1000;

let historyIndex: AutocompletionCandidate[] | null = null;
let historyIndexPromise: Promise<AutocompletionCandidate[]> | null = null;
let historyIndexBuiltAt = 0;

export function getHistoryIndexSync(): AutocompletionCandidate[] | null {
  return historyIndex;
}

export function invalidateHistoryIndex(): void {
  historyIndex = null;
}

export async function ensureHistoryIndex(): Promise<AutocompletionCandidate[]> {
  if (
    historyIndex &&
    Date.now() - historyIndexBuiltAt <= HISTORY_INDEX_TTL_MS
  ) {
    return historyIndex;
  }
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

    const parsed: AutocompletionCandidate[] = [];
    for (const item of items) {
      const entry = parseHistoryEntry(item);
      if (entry) parsed.push(entry);
    }
    return parsed;
  })();

  try {
    const result = await historyIndexPromise;
    historyIndex = result;
    historyIndexBuiltAt = Date.now();
    return result;
  } finally {
    historyIndexPromise = null;
  }
}
