import { hideGlance } from "../../features/glance/components/glance.component";
import { hideSpotlight } from "../../features/spotlight/components/spotlight.component";
import {
  handleCtrlEnter,
  handleEnter,
  handleTab,
} from "../../features/spotlight/handlers/keyboard.handler";
import { navigateResults } from "../../features/spotlight/components/result-item.component";
import { openSwitcher, closeSwitcher } from "../../features/tab-switcher/components/switcher.component";
import {
  updateSelection,
  getTabItemsCount,
} from "../../features/tab-switcher/handlers/selection.handler";
import { config } from "../config/config";
import { getSearchInput } from "../utils/dom.utils";
import { getHostRoot } from "../utils/host.utils";

export function handleGlobalKeys(e: KeyboardEvent): void {
  try {
    const isSpotlightOpen = config.isSpotlightOpen;
    const isTabOpen = config.isTabOpen;
    const isGlanceOpen = config.isGlanceOpen;

    const isModifier = e.metaKey || e.ctrlKey;

    if (
      isModifier &&
      e.code === "Space" &&
      !isSpotlightOpen &&
      config.isTabEnabled
    ) {
      e.preventDefault();

      if (!isTabOpen) {
        config.isTabOpen = true;
        openSwitcher(e.shiftKey);
      } else {
        const tabsLen = getTabItemsCount();

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

    // Spotlight is the topmost overlay when open, so it consumes its keys first
    // (even when stacked above Glance).
    if (isSpotlightOpen) {
      const root = getHostRoot();
      const searchInput = getSearchInput();
      if (!root || !searchInput) return;

      if (e.key === "/" || e.key === "Escape" || e.key === "Tab") {
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

      if (root.activeElement !== searchInput) {
        searchInput.focus();
      }

      e.stopImmediatePropagation();
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        navigateResults(e.key);
      } else if (e.ctrlKey && e.key === "Enter") {
        handleCtrlEnter();
      } else if (e.key === "Enter") {
        handleEnter();
      }
      return;
    }

    if (isTabOpen && e.key === "Escape") {
      e.preventDefault();
      closeSwitcher();
      return;
    }

    if (isGlanceOpen && e.key === "Escape") {
      e.stopImmediatePropagation();
      e.preventDefault();
      hideGlance();
      return;
    }
  } catch (err) {
    // biome-ignore lint/suspicious/noConsole: diagnostic logging
    console.error("handleGlobalKeys error:", err);
  }
}
