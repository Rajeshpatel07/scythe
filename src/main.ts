import { createModelUI } from "./ui/model";
import { populateHistory } from "./browser/history";
import { updateSuggestion, searchAndSuggest } from "./browser/suggestion";
import { handleGlobalKeys } from "./events/keyboard";
import { createNewTabPage, SidebarSettings } from "./ui/newtab";
import { config } from "./config";

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
  if (
    //@ts-ignore
    !engineTrigger?.contains(event.target) &&
    //@ts-ignore
    !engineOptionsList?.contains(event.target)
  ) {
    engineOptionsList?.classList.remove("spotlight-open");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  createNewTabPage();
  SidebarSettings();
});

export function showSpotlight() {
  config.isNewtab = false;
  config.isModelOpen = true;
  createModelUI();
  const shadowHost = document.getElementById("spotlight-host");
  const shadowRoot = shadowHost?.shadowRoot;
  if (shadowRoot) {
    const searchInput = shadowRoot.getElementById(
      "spotlight-search-input-ext",
    ) as HTMLInputElement;

    let debounceTimeout: NodeJS.Timeout;
    searchInput.addEventListener("input", () => {
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
    });

    document.addEventListener("keydown", handleGlobalKeys);

    populateHistory();
    updateSuggestion("");
  }
}
