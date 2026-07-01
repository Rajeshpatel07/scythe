import { createNewTabPage } from "./features/new-tab/components/newtab.component";
import { SidebarSettings } from "./features/new-tab/components/sidebar.component";
import { config } from "./core/config/config";
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

document.addEventListener("click", (event: MouseEvent) => {
  const engineTrigger = document.getElementById(
    "spotlight-engine-trigger",
  ) as HTMLButtonElement;
  const engineOptionsList = document.getElementById(
    "spotlight-engine-options-list",
  ) as HTMLUListElement;

  if (event.target instanceof HTMLElement) {
    if (
      engineTrigger &&
      engineOptionsList &&
      !engineTrigger.contains(event.target) &&
      !engineOptionsList.contains(event.target)
    ) {
      engineOptionsList.classList.remove("spotlight-open");
    }
  }
});

document.addEventListener("DOMContentLoaded", () => {
  createNewTabPage();
  SidebarSettings();
});

export function showSpotlight() {
  if (!config.isSpotlightOpen && !config.isTabOpen) {
    config.openNewtab = false;
    config.isSpotlightOpen = true;
    handleWebSearch();
  }
}
