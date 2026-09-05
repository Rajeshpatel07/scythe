import { config } from "../../../core/config/config";
import { handleSearchSubmit } from "../services/search-runner.service";
import { hideSpotlight } from "../components/spotlight.component";
import {
  getFirstResultItem,
  getSearchInput,
  getSelectedResultItem,
} from "../utils/spotlight.dom";
import { openUrl } from "../../../core/services/navigation.service";
import { MessageBroker } from "../../../core/messaging/message.broker";
import { RESULT_URL_ATTRIBUTE } from "../spotlight.constants";

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
  const url = firstItem.getAttribute(RESULT_URL_ATTRIBUTE);
  if (url) {
    hideSpotlight();
    if (config.openInNewTab) {
      MessageBroker.send({ action: "createTab", url: url, active: true }).catch(
        () => {},
      );
    } else {
      openUrl(url);
    }
  }
}

export function handleTabCompletion(): void {
  if (!config.currentAutocompletion) return;

  const searchInput = getSearchInput();

  if (searchInput) {
    searchInput.value = config.currentAutocompletion;
    // Programmatic value sets don't fire "input"; dispatch it so the
    // results list and autocompletion re-run for the completed text.
    searchInput.dispatchEvent(new Event("input", { bubbles: true }));
  }
  config.currentAutocompletion = "";
}
