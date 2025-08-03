import { createModelUI } from "./ui/model";
import { updateSuggestion, searchAndSuggest } from "./browser/suggestion";
import { populateHistory } from "./browser/history";
import { handleGlobalKeys } from "./events/keyboard";
import { config } from "./config";

window.addEventListener("keydown", handleGlobalKeys, true);

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
          } else {
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
