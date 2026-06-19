import { config } from "../core/config/config";
import { getShadowRoot, getSearchInput } from "../core/utils/dom.utils";
import { openSwitcher } from "../features/tab-switcher/components/switcher.component";
import {
  updateSelection,
  confirmSelection,
} from "../features/tab-switcher/handlers/selection.handler";
import { hideSpotlight } from "../features/spotlight/components/modal.component";
import { fireCustomInputEvent } from "../features/spotlight/handlers/input.handler";
import {
  handleArrowNavigation,
  handleCtrlEnter,
  handleEnter,
  handleTab,
  IgnoreKeys,
} from "../features/spotlight/handlers/keyboard.handler";
import { handleWebSearch } from "../features/spotlight/services/search.service";

function handleGlobalKeys(e: KeyboardEvent) {
  const isModifier = e.metaKey || e.ctrlKey;

  if (isModifier) {
    config.modifierPressed = true;
  }

  if (isModifier && e.code === "Space" && !config.isModelOpen) {
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

  if (config.isModelOpen) {
    e.stopImmediatePropagation();
    if (IgnoreKeys(e)) {
      return;
    }
    e.preventDefault();

    fireCustomInputEvent(e, searchInput);
  }
}

window.addEventListener("keydown", handleGlobalKeys, { capture: true });
window.addEventListener(
  "keyup",
  (e: KeyboardEvent) => {
    if (config.isModelOpen || config.isTabOpen) {
      e.stopImmediatePropagation();
      e.preventDefault();
      if (e.key === "Meta" || e.key === "Control") {
        config.modifierPressed = false;
        if (config.isTabOpen) {
          confirmSelection();
        }
      }
    }
  },
  { capture: true },
);

chrome.storage.sync.get(["searchEngine"], (result) => {
  if (result.searchEngine) {
    config.searchEngine = result.searchEngine;
  }
});

chrome.runtime.onMessage.addListener(
  async (request, _sender, _sendResponse) => {
    if (request.action === "toggleSpotlight") {
      if (!config.isModelOpen && !config.isTabOpen) {
        config.openNewtab = true;
        config.isModelOpen = true;
        handleWebSearch();
      }
      return;
    }
  },
);
