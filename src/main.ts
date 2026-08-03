import { createNewTabPage } from "./features/new-tab/components/newtab.component";
import { config, initializeConfig } from "./core/config/config";
import { handleWebSearch } from "./features/spotlight/services/search.service";
import { confirmSelection } from "./features/tab-switcher/handlers/selection.handler";
import { handleGlobalKeys } from "./core/handlers/keyboard.router";

window.addEventListener(
  "keyup",
  (e: KeyboardEvent) => {
    if (e.key === "Meta" || e.key === "Control") {
      config.modifierPressed = false;
      if (config.isTabOpen) {
        confirmSelection();
      }
      return;
    }
  },
  { capture: true },
);

document.addEventListener("keydown", handleGlobalKeys, { capture: true });
document.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.ctrlKey && e.key === "/") {
    e.preventDefault();
    if (!config.isSpotlightOpen) {
      showSpotlight();
    }
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  await initializeConfig();
  createNewTabPage();
});

export function showSpotlight(): void {
  if (
    !config.isSpotlightOpen &&
    !config.isTabOpen &&
    config.isSpotlightEnabled
  ) {
    config.openNewtab = false;
    config.isSpotlightOpen = true;
    handleWebSearch();
  }
}
