import { createModelUI } from "./ui/model";
import { populateHistory } from "./browser/history";
import { updateSuggestion, searchAndSuggest } from "./browser/suggestion";
import { handleGlobalKeys } from "./events/keyboard";
import { createNewTabPage } from "./ui/newtab";
import { config } from "./config";

document.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.ctrlKey && e.key === "/") {
    e.preventDefault();
    if (!config.isModelOpen) {
      showSpotlight();
    }
  }
});

document.addEventListener("DOMContentLoaded", () => {
  createNewTabPage();
  showSpotlight();
});

export function showSpotlight() {
  config.openNewtab = false;
  config.isModelOpen = true;
  createModelUI();
  const searchInput = document.getElementById(
    "spotlight-search-input-ext",
  ) as HTMLInputElement;

  let debounceTimeout: NodeJS.Timeout;
  searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      const query = searchInput.value.trim();
      updateSuggestion(query);
      if (query.length > 0) {
        searchAndSuggest(query);
      } else {
        populateHistory();
      }
    }, 800);
  });

  document.addEventListener("keydown", handleGlobalKeys);

  populateHistory();
  updateSuggestion("");
}
