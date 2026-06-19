import { config } from "../../../core/config/config";
import { handleSearchSubmit } from "../services/search.service";
import { navigateResults } from "../components/list-item.component";
import { hideSpotlight } from "../components/modal.component";
import {
  getFirstResultItem,
  getSearchInput,
  getSelectedResultItem,
} from "../../../core/utils/dom.utils";
import { MessageBroker } from "../../../core/messaging/message.broker";

export function IgnoreKeys(e: KeyboardEvent) {
  if (
    e.key === "ArrowLeft" ||
    e.key === "ArrowRight" ||
    (e.ctrlKey &&
      (e.key === "v" ||
        e.key === "c" ||
        e.key === "Backspace" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight" ||
        (e.shiftKey && e.key === "Backspace")))
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
    const query = searchInput.value.trim();
    if (query.length) {
      handleSearchSubmit(searchInput.value);
    } else {
      searchInput.value = "";
    }
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
    if (config.openNewtab) {
      MessageBroker.send({ action: "createTab", url: url });
    } else {
      window.location.href = url;
    }
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
