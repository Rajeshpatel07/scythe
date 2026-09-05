import { config } from "../../../core/config/config";
import { createSpotlightUI } from "../components/spotlight.component";
import { getHostRoot } from "../../../core/utils/host.utils";
import { populateHistory } from "./history-list.service";
import { ensureHistoryIndex } from "./history-index.store";
import {
  setAutocompletion,
  updateAutocompletionInstant,
} from "./autocompletion.service";
import {
  invalidatePendingSearch,
  searchAndSuggest,
} from "./search-runner.service";
import { SEARCH_DEBOUNCE_MS } from "../spotlight.constants";

let searchTimeout: ReturnType<typeof setTimeout> | undefined;

export function showSpotlight(): void {
  if (
    !config.isSpotlightOpen &&
    !config.isTabOpen &&
    config.isSpotlightEnabled
  ) {
    config.openInNewTab = false;
    config.isSpotlightOpen = true;
    handleWebSearch();
  }
}

export function handleWebSearch(): void {
  createSpotlightUI();
  const root = getHostRoot();
  if (!root) return;

  ensureHistoryIndex().catch(() => {});

  const searchInput = root.getElementById(
    "spotlight-search-input-ext",
  ) as HTMLInputElement | null;
  if (!searchInput) return;

  clearTimeout(searchTimeout);

  searchInput.addEventListener(
    "input",
    () => {
      const query = searchInput.value.trim();

      clearTimeout(searchTimeout);

      if (searchInput.value.length === 0) {
        invalidatePendingSearch();
        populateHistory();
        setAutocompletion(root, "");
        return;
      }

      if (query.length === 0) {
        invalidatePendingSearch();
        return;
      }

      // Instant feedback from the local index (0ms) keeps typing feeling
      // snappy; the debounced history query refines it with the full index.
      updateAutocompletionInstant(query, root);

      searchTimeout = setTimeout(() => {
        void searchAndSuggest(query);
      }, SEARCH_DEBOUNCE_MS);
    },
    true,
  );

  populateHistory();
  setAutocompletion(root, "");
}
