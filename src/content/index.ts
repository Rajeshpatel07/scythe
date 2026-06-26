import { config } from "../core/config/config";
import { confirmSelection } from "../features/tab-switcher/handlers/selection.handler";
import { handleWebSearch } from "../features/spotlight/services/search.service";
import type { searchEngineInterface } from "../core/types/domain.types";
import { handleGlobalKeys } from "../core/utils/keydown.handler";

window.addEventListener("keydown", handleGlobalKeys, { capture: true });
window.addEventListener(
  "keyup",
  (e: KeyboardEvent) => {
    if (config.isModelOpen || config.isTabOpen) {
      e.stopImmediatePropagation();
      e.preventDefault();
      if (e.key === "Meta" || e.key === "Control") {
        config.modifierPressed = false;
        if (config.isTabOpen) {
          confirmSelection();
        }
      }
    }
  },
  { capture: true },
);

chrome.storage.sync.get<searchEngineInterface>(["searchEngine"], (result) => {
  if (result?.searchEngine) {
    config.searchEngine = result.searchEngine;
  }
});

chrome.runtime.onMessage.addListener(
  async (request, _sender, _sendResponse) => {
    if (request.action === "toggleSpotlight") {
      if (!config.isModelOpen && !config.isTabOpen) {
        config.openNewtab = true;
        config.isModelOpen = true;
        handleWebSearch();
      }
      return;
    }
  },
);
