import { config } from "../../../core/config/config";
import { hideSpotlight } from "../components/spotlight.component";
import { getHostRoot } from "../../../core/utils/host.utils";
import { MessageBroker } from "../../../core/messaging/message.broker";
import type { HistoryResponse } from "../../../core/types/domain.types";
import {
  createListItem,
  renderListItems,
} from "../components/result-item.component";
import { resolveUrl, openUrl } from "../../../core/services/navigation.service";
import { parseHistoryEntry } from "./autocompletion.engine";
import {
  applyAutocompletion,
  clearAutocompletionUnlessPrefix,
} from "./autocompletion.service";
import {
  SEARCHING_PLACEHOLDER_HTML,
  SEARCH_FAILED_HTML,
  SEARCH_MAX_RESULTS,
  SPOTLIGHT_IDS,
  VISIBLE_RESULTS,
} from "../spotlight.constants";

let searchVersion = 0;

export function invalidatePendingSearch(): void {
  searchVersion++;
}

export function handleSearchSubmit(input: string): void {
  const trimmedInput = input.trim();
  if (trimmedInput.length === 0) return;

  const url = resolveUrl(trimmedInput);
  hideSpotlight();
  openUrl(url, config.openInNewTab);
}

export async function searchAndSuggest(query: string): Promise<void> {
  searchVersion++;
  const currentVersion = searchVersion;

  const root = getHostRoot();
  if (!root) return;

  const resultsList = root.getElementById(
    SPOTLIGHT_IDS.resultsList,
  ) as HTMLUListElement | null;
  if (!resultsList) return;

  resultsList.innerHTML = SEARCHING_PLACEHOLDER_HTML;

  // One substring query over the full history feeds both the results list
  // (top entries) and the autocompletion text, so deep paths like
  // github.com/<user> are still suggestable.
  let response: HistoryResponse | null = null;
  try {
    response = await MessageBroker.send({
      action: "searchHistory",
      query,
      maxResults: SEARCH_MAX_RESULTS,
    });
  } catch {
    response = null;
  }

  if (currentVersion !== searchVersion) return;

  // The input may have moved on while the query was in flight; a newer
  // debounced search will cover it, so never paint stale results or completions.
  const liveInput =
    (
      root.getElementById(SPOTLIGHT_IDS.searchInput) as HTMLInputElement | null
    )?.value.trim() ?? query;
  if (liveInput !== query) return;

  if (!response?.history) {
    resultsList.innerHTML = SEARCH_FAILED_HTML;
    clearAutocompletionUnlessPrefix(root, query);
    return;
  }

  renderResults(resultsList, query, response.history);

  const candidates = [];
  for (const item of response.history) {
    const entry = parseHistoryEntry(item);
    if (entry) candidates.push(entry);
  }
  applyAutocompletion(root, query, candidates);
}

function renderResults(
  resultsList: HTMLUListElement,
  query: string,
  history: HistoryResponse["history"],
): void {
  resultsList.innerHTML = "";
  if (history.length === 0 && query.length > 0) {
    const li = createListItem({ title: query, url: query, showUrl: false });
    resultsList.appendChild(li);
    return;
  }

  renderListItems(
    history
      .slice(0, VISIBLE_RESULTS)
      .map((item) => ({ title: item.title || item.url, url: item.url || "" })),
    resultsList,
  );
}
