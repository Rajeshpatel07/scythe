import { createModelUI } from "./ui/model";
import { updateSuggestion, searchAndSuggest } from "./browser/suggestion";
import { populateHistory } from "./browser/history";
import { handleGlobalKeys } from "./events/keyboard";
import { config } from "./config";
import { getShadowHost, getShadowRoot } from "./utils/dom";

window.addEventListener("keydown", handleGlobalKeys, true);
window.addEventListener(
  "keyup",
  (e: KeyboardEvent) => {
    const shadowHost = getShadowHost();
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

  const shadowRoot = getShadowRoot();

  if (!shadowRoot) return;

  const searchInput = shadowRoot.getElementById(
    "spotlight-search-input-ext",
  ) as HTMLInputElement;

  let debounceTimeout: NodeJS.Timeout;
  searchInput.addEventListener(
    "input",
    () => {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(async () => {
        const query = searchInput.value.trim();
        if (query.length > 0) {
          await searchAndSuggest(query);
        } else if (searchInput.value.length === 0) {
          populateHistory();
        }
        updateSuggestion(query);
      }, 100);
    },
    true,
  );

  populateHistory();
  updateSuggestion("");
}
