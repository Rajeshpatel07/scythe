import { config } from "../../../core/config/config";
import { handleSearchSubmit } from "../services/search.service";
import { hideSpotlight } from "../components/spotlight.component";
import {
  getFirstResultItem,
  getSearchInput,
  getSelectedResultItem,
} from "../../../core/utils/dom.utils";
import { MessageBroker } from "../../../core/messaging/message.broker";

export function handleEnter(): void {
  const searchInput = getSearchInput();
  if (!searchInput) return;

  const selectedItem = getSelectedResultItem();
  if (selectedItem) {
    selectedItem.click();
    return;
  }

  const query = searchInput.value.trim();
  if (query.length) {
    handleSearchSubmit(searchInput.value);
  }
}

export function handleCtrlEnter(): void {
  const firstItem = getFirstResultItem();
  if (!firstItem) return;
  const url = firstItem.getAttribute("data-url");
  if (url) {
    hideSpotlight();
    if (config.openInNewTab) {
      MessageBroker.send({ action: "createTab", url: url, active: true }).catch(
        () => {},
      );
    } else {
      window.location.href = url;
    }
  }
}

export function handleTab(): void {
  if (!config.currentSuggestion) return;

  const searchInput = getSearchInput();

  if (searchInput) {
    searchInput.value = config.currentSuggestion;
    // Programmatic value sets don't fire "input"; dispatch it so the
    // results list and ghost re-run for the completed text.
    searchInput.dispatchEvent(new Event("input", { bubbles: true }));
  }
  config.currentSuggestion = "";
}
