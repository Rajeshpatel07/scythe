import { handleGlobalKeys } from "./events/keyboard";
import { config } from "./config/config.ts";
import { getShadowHost } from "./utils/dom";
import { handleWebSearch } from "./browser/search.ts";
import { confirmSelection } from "./ui/tabs.ts";

window.addEventListener("keydown", handleGlobalKeys, { capture: true });
window.addEventListener(
  "keyup",
  (e: KeyboardEvent) => {
    const shadowHost = getShadowHost();
    if (
      (shadowHost && e.composedPath().includes(shadowHost)) ||
      config.tabIsOpen
    ) {
      e.stopImmediatePropagation();
      e.preventDefault();
      if (e.key === "Meta" || e.key === "Control") {
        config.modifierPressed = false;
        if (config.tabIsOpen) {
          confirmSelection();
        }
      }
    }
  },
  { capture: true },
);

chrome.storage.sync.get(["searchEngine"], (result) => {
  config.searchEngine = result.searchEngine;
});

//Initial starting point.
chrome.runtime.onMessage.addListener(
  async (request, _sender, _sendResponse) => {
    if (request.action === "toggleSpotlight") {
      if (!config.isModelOpen) {
        config.openNewtab = true;
        config.isModelOpen = true;
        handleWebSearch();
      }
      return;
    }
  },
);
