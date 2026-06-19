import { createNewTabPage } from "./features/new-tab/components/newtab.component";
import { SidebarSettings } from "./features/new-tab/components/sidebar.component";
import { config } from "./core/config/config";
import { handleWebSearch } from "./features/spotlight/services/search.service";
import { openSwitcher } from "./features/tab-switcher/components/switcher.component";
import {
  confirmSelection,
  updateSelection,
} from "./features/tab-switcher/handlers/selection.handler";
import {
  getShadowRoot,
  getSearchInput,
  getShadowHost,
} from "./core/utils/dom.utils";
import {
  handleArrowNavigation,
  handleCtrlEnter,
  handleEnter,
  handleTab,
  IgnoreKeys,
} from "./features/spotlight/handlers/keyboard.handler";
import { hideSpotlight } from "./features/spotlight/components/modal.component";
import { fireCustomInputEvent } from "./features/spotlight/handlers/input.handler";

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

window.addEventListener(
  "keyup",
  (e: KeyboardEvent) => {
    if (e.key === "Meta" || e.key === "Control") {
      config.modifierPressed = false;
      if (config.isTabOpen) {
        confirmSelection();
      }
      return;
    }
  },
  { capture: true },
);

document.addEventListener("keydown", handleGlobalKeys);
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

  if (event.target instanceof HTMLElement) {
    if (
      engineTrigger &&
      engineOptionsList &&
      !engineTrigger.contains(event.target) &&
      !engineOptionsList.contains(event.target)
    ) {
      engineOptionsList.classList.remove("spotlight-open");
    }
  }
});

document.addEventListener("DOMContentLoaded", () => {
  createNewTabPage();
  SidebarSettings();
});

export function showSpotlight() {
  if (!config.isModelOpen && !config.isTabOpen) {
    config.openNewtab = false;
    config.isModelOpen = true;
    handleWebSearch();
  }
}
