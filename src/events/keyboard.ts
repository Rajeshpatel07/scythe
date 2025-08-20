import { config } from "../config";
import { hideSpotlight } from "../ui/model.ts";
import { fireCustomInputEvent } from "./customInputEvent";
import { getSearchInput, getShadowHost } from "../utils/dom";
import {
  IgnoreKeys,
  handleArrowNavigation,
  handleCtrlEnter,
  handleEnter,
  handleTab,
} from "../utils/keyHandlers.ts";

export function handleGlobalKeys(e: KeyboardEvent) {
  const searchInput = getSearchInput();
  if (!searchInput) return;

  if (document.activeElement !== searchInput) {
    searchInput.focus();
  }

  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
    handleArrowNavigation(e.key);
  } else if (e.ctrlKey && e.key === "Enter") {
    handleCtrlEnter();
  } else if (e.key === "Enter") {
    handleEnter();
  } else if (e.key === "Tab" && config.currentSuggestion) {
    handleTab();
  } else if (e.key === "Escape") {
    hideSpotlight();
  }

  const shadowHost = getShadowHost();
  if (shadowHost && e.composedPath().includes(shadowHost)) {
    e.stopImmediatePropagation();
    if (IgnoreKeys(e)) {
      return;
    }
    e.preventDefault();

    fireCustomInputEvent(e, searchInput);
  }
}
