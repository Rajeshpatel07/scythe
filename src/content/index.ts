import { config } from "../core/config/config";
import { confirmSelection } from "../features/tab-switcher/handlers/selection.handler";
import { handleWebSearch } from "../features/spotlight/services/search.service";
import type { searchEngineInterface } from "../core/types/domain.types";
import { handleGlobalKeys } from "../core/handlers/keyboard.router";
import { openGlanceModal } from "../features/glance/components/glance.component";

document.addEventListener(
  "click",
  (event) => {
    try {
      if (event.altKey) {
        if (
          !config.isGlanceOpen &&
          !config.isTabOpen &&
          !config.isSpotlightOpen
        ) {
          //@ts-ignore
          const link = event?.target.closest("a");

          if (link?.href) {
            event.preventDefault();
            event.stopPropagation();

            config.isGlanceOpen = true;
            openGlanceModal(link.href);
            return;
          }
        }
      }
    } catch {
      // ignore
    }
  },
  true,
);

window.addEventListener("keydown", handleGlobalKeys, { capture: true });
window.addEventListener(
  "keyup",
  (e: KeyboardEvent) => {
    try {
      if (config.isSpotlightOpen || config.isTabOpen) {
        e.stopImmediatePropagation();
        e.preventDefault();
        if (e.key === "Meta" || e.key === "Control") {
          config.modifierPressed = false;
          if (config.isTabOpen) {
            confirmSelection();
          }
        }
      }
    } catch {
      // ignore
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
    try {
      if (request.action === "toggleSpotlight") {
        if (
          !config.isSpotlightOpen &&
          !config.isTabOpen &&
          !config.isGlanceOpen
        ) {
          config.openNewtab = true;
          config.isSpotlightOpen = true;
          handleWebSearch();
        }
        return;
      }
    } catch {
      // ignore
    }
  },
);
