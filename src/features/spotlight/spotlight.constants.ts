export const SEARCH_DEBOUNCE_MS = 150;
export const SEARCH_MAX_RESULTS = 150;
export const HISTORY_SNAPSHOT_SIZE = 1000;
export const VISIBLE_RESULTS = 8;
export const PERSISTED_HISTORY = 50;
export const TYPED_COUNT_WEIGHT = 10;
export const NO_SELECTION = -1;

export const SPOTLIGHT_IDS = {
  searchInput: "spotlight-search-input-ext",
  resultsList: "spotlight-results-ext",
  suggestion: "spotlight-suggestion-ext",
} as const;

export const SPOTLIGHT_CLASSES = {
  resultItem: "spotlight-result-item-ext",
  selected: "selected",
  closing: "closing",
} as const;

export const RESULT_URL_ATTRIBUTE = "data-url";

export const SEARCHING_PLACEHOLDER_HTML = "<li>Searching history...</li>";
export const SEARCH_FAILED_HTML =
  "<li class='spotlight-result-item-ext'>Could not search history. Fetching web suggestions...</li>";
export const EMPTY_HISTORY_HTML = "<li>No recent history.</li>";
