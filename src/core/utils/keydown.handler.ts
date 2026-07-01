import { hideSpotlight } from "../../features/spotlight/components/modal.component";
import {
  handleArrowNavigation,
  handleCtrlEnter,
  handleEnter,
  handleTab,
} from "../../features/spotlight/handlers/keyboard.handler";
import { openSwitcher } from "../../features/tab-switcher/components/switcher.component";
import { updateSelection } from "../../features/tab-switcher/handlers/selection.handler";
import { config } from "../config/config";
import { getSearchInput, getShadowRoot } from "./dom.utils";

export function handleGlobalKeys(e: KeyboardEvent) {
  const isModifier = e.metaKey || e.ctrlKey;

  if (isModifier) {
    config.modifierPressed = true;
  }

  if (
    isModifier &&
    e.code === "Space" &&
    !config.isSpotlightOpen &&
    !config.isGlanceOpen
  ) {
    e.preventDefault();

    if (!config.isTabOpen) {
      config.isTabOpen = true;
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
  const searchInput = getSearchInput();
  if (!shadowRoot || !searchInput) return;

  if (e.key === "/" || e.key === "Escape" || e.key === "Tab") {
    e.stopPropagation();
    e.stopImmediatePropagation();
    e.preventDefault();

    if (e.key === "/") {
      searchInput.focus();
      searchInput.value += "/";
      searchInput.dispatchEvent(new Event("input", { bubbles: true }));
    } else if (e.key === "Escape") {
      hideSpotlight();
    } else if (e.key === "Tab") {
      handleTab();
    }
    return;
  }

  if (document.activeElement !== searchInput) {
    searchInput.focus();
  }

  e.stopPropagation();
  e.stopImmediatePropagation();
  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
    e.preventDefault();
    handleArrowNavigation(e.key);
  } else if (e.ctrlKey && e.key === "Enter") {
    handleCtrlEnter();
  } else if (e.key === "Enter") {
    handleEnter();
  }
}
