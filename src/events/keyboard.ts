import { config } from "../config/config.ts";
import { hideSpotlight } from "../ui/model.ts";
import { fireCustomInputEvent } from "./customInputEvent";
import { getSearchInput, getShadowHost, getShadowRoot } from "../utils/dom";
import {
  IgnoreKeys,
  handleArrowNavigation,
  handleCtrlEnter,
  handleEnter,
  handleTab,
} from "./keyHandlers.ts";
import { openSwitcher, updateSelection } from "../ui/tabs.ts";

export function handleGlobalKeys(e: KeyboardEvent) {
  const isModifier = e.metaKey || e.ctrlKey;

  if (isModifier) {
    config.modifierPressed = true;
  }

  if (isModifier && e.code === "Space") {
    e.preventDefault();

    if (!config.tabIsOpen) {
      config.tabIsOpen = true;
      openSwitcher(e.shiftKey);
    } else {
      const shadowRoot = getShadowRoot();
      if (!shadowRoot) return;

      const items = shadowRoot.querySelectorAll(".tab-item");
      const tabsLen = items.length;

      let nextIndex: number;
      if (e.shiftKey) {
        nextIndex = (config.tabSelectedIndex - 1 + tabsLen) % tabsLen;
      } else {
        nextIndex = (config.tabSelectedIndex + 1) % tabsLen;
      }
      updateSelection(nextIndex);
    }
    return;
  }

  const shadowRoot = getShadowRoot();
  if (!shadowRoot) return;

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
