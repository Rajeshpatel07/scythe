import { config } from "../config.ts";
import { handleSearchSubmit } from "../browser/search";
import { navigateResults } from "../ui/list";
import { hideSpotlight } from "../ui/model";
import {
  getFirstResultItem,
  getSearchInput,
  getSelectedResultItem,
} from "./dom";

export function IgnoreKeys(e: KeyboardEvent) {
  if (
    e.key === "ArrowLeft" ||
    e.key === "ArrowRight" ||
    (e.ctrlKey &&
      (e.key === "v" ||
        e.key === "c" ||
        e.key === "Backspace" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight"))
  ) {
    return true;
  }
  return false;
}

export function handleEnter() {
  const searchInput = getSearchInput();
  if (!searchInput) return;

  const selectedItem = getSelectedResultItem();
  if (selectedItem) {
    selectedItem.click();
  } else {
    handleSearchSubmit(searchInput.value);
  }
}

export function handleArrowNavigation(key: string) {
  if (key === "ArrowUp" || key === "ArrowDown") {
    navigateResults(key);
  }
}

export function handleCtrlEnter() {
  const firstItem = getFirstResultItem();
  if (!firstItem) return;
  const url = firstItem.getAttribute("data-url");
  if (url) {
    hideSpotlight();
    chrome.runtime.sendMessage({ action: "createTab", url: url });
  }
}

export function handleTab() {
  if (!config.currentSuggestion) return;

  const searchInput = getSearchInput();

  if (searchInput) {
    searchInput.value = config.currentSuggestion;
  }
  config.currentSuggestion = "";
}
