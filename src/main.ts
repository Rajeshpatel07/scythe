import { handleGlobalKeys } from "./events/keyboard";
import { createNewTabPage } from "./ui/newtab";
import { config } from "./config/config.ts";
import { SidebarSettings } from "./ui/sidebar.ts";
import { handleWebSearch } from "./browser/search.ts";
import { confirmSelection } from "./ui/tabs.ts";

window.addEventListener(
  "keyup",
  (e: KeyboardEvent) => {
    if (e.key === "Meta" || e.key === "Control") {
      config.modifierPressed = false;
      if (config.tabIsOpen) {
        confirmSelection();
      }
      return;
    }
  },
  { capture: true },
);

document.addEventListener("keydown", handleGlobalKeys);
document.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.ctrlKey && e.key === "/") {
    e.preventDefault();
    if (!config.isModelOpen) {
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
  config.openNewtab = false;
  config.isModelOpen = true;
  handleWebSearch();
}
