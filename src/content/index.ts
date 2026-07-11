import { config, initializeConfig } from "../core/config/config";
import { confirmSelection } from "../features/tab-switcher/handlers/selection.handler";
import { handleWebSearch } from "../features/spotlight/services/search.service";
import { handleGlobalKeys } from "../core/handlers/keyboard.router";
import { openGlanceModal } from "../features/glance/components/glance.component";

document.addEventListener(
  "click",
  (event: MouseEvent) => {
    if (!event.altKey) return;
    if (
      config.isGlanceOpen ||
      config.isTabOpen ||
      config.isSpotlightOpen ||
      !config.isGlanceEnabled
    ) {
      return;
    }

    const link = (event.target as Element | null)?.closest("a");
    if (!link?.href) return;

    event.preventDefault();
    event.stopPropagation();
    config.isGlanceOpen = true;
    openGlanceModal(link.href);
  },
  true,
);

window.addEventListener("keydown", handleGlobalKeys, { capture: true });
window.addEventListener(
  "keyup",
  (e: KeyboardEvent) => {
    if (!config.isSpotlightOpen && !config.isTabOpen) return;

    if (e.key === "Meta" || e.key === "Control") {
      e.stopImmediatePropagation();
      e.preventDefault();
      config.modifierPressed = false;
      if (config.isTabOpen) {
        confirmSelection();
      }
    }
  },
  { capture: true },
);

initializeConfig();

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "toggleSpotlight") {
    if (
      !config.isSpotlightOpen &&
      !config.isTabOpen &&
      !config.isGlanceOpen &&
      config.isSpotlightEnabled
    ) {
      config.openNewtab = true;
      config.isSpotlightOpen = true;
      handleWebSearch();
    }
  }
});
