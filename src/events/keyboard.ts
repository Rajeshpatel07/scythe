import { config } from "../config";
import { hideSpotlight } from "../ui/model";
import { handleSearchSubmit } from "../browser/search";
import { navigateResults } from "../ui/list";

export function handleGlobalKeys(e: KeyboardEvent) {
  const shadowHost = document.getElementById("spotlight-host");
  const shadowRoot = shadowHost?.shadowRoot;
  if (!shadowRoot) return;

  const searchInput = shadowRoot.getElementById(
    "spotlight-search-input-ext",
  ) as HTMLInputElement;
  if (document.activeElement !== searchInput) {
    if (e.key.length === 1 || e.key === "Backspace") {
      searchInput.focus();
    }
  }

  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
    e.preventDefault();
    navigateResults(e.key);
  } else if (e.key === "Enter") {
    e.preventDefault();
    const selectedItem = shadowRoot.querySelector(
      ".spotlight-result-item-ext.selected",
    ) as HTMLLIElement;
    if (selectedItem) {
      selectedItem.click();
    } else {
      handleSearchSubmit();
    }
  } else if (e.key === "Tab" && config.currentSuggestion) {
    e.preventDefault();
    searchInput.value = config.currentSuggestion;
    const reslutList = shadowRoot.getElementById(
      "spotlight-suggestion-ext",
    ) as HTMLUListElement;
    reslutList.innerText = "";
    config.currentSuggestion = "";
  } else if (e.key === "Escape") {
    e.preventDefault();
    hideSpotlight();
  }

  e.stopImmediatePropagation();
}
