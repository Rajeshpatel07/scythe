import { createModelUI } from "./ui/model";
import { updateSuggestion, searchAndSuggest } from "./browser/suggestion";
import { populateHistory } from "./browser/history";
import { handleGlobalKeys } from "./events/keyboard";
import { config } from "./config";

chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
  if (request.action === "toggleSpotlight") {
    showSpotlight();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  showSpotlight();
});

function showSpotlight() {
  config.openNewtab = true;
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
