import { createModelUI } from "./ui/model";
import { updateSuggestion, searchAndSuggest } from "./browser/suggestion";
import { populateHistory } from "./browser/history";
import { handleGlobalKeys } from "./events/keyboard";
import { config } from "./config";

window.addEventListener("keydown", handleGlobalKeys, true);
window.addEventListener(
  "keyup",
  (e: KeyboardEvent) => {
    const shadowHost = document.getElementById("spotlight-host");
    if (shadowHost && e.composedPath().includes(shadowHost)) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  },
  { capture: true },
);

chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
  if (request.action === "toggleSpotlight") {
    if (!config.isModelOpen) showSpotlight();
  }
});

function showSpotlight() {
  config.openNewtab = true;
  config.isModelOpen = true;
  createModelUI();
  const shadowHost = document.getElementById("spotlight-host");
  const shadowRoot = shadowHost?.shadowRoot;

  if (shadowRoot) {
    const searchInput = shadowRoot.getElementById(
      "spotlight-search-input-ext",
    ) as HTMLInputElement;

    let debounceTimeout: NodeJS.Timeout;
    searchInput.addEventListener(
      "input",
      () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
          const query = searchInput.value.trim();
          updateSuggestion(query);
          if (query.length > 0) {
            searchAndSuggest(query);
          } else if (searchInput.value.length === 0) {
            populateHistory();
          }
        }, 50);
      },
      true,
    );

    populateHistory();
    updateSuggestion("");
  }
}
