import { hideGlance } from "../../features/glance/components/glance.component";
import { hideSpotlight } from "../../features/spotlight/components/spotlight.component";
import {
  handleCtrlEnter,
  handleEnter,
  handleTab,
} from "../../features/spotlight/handlers/keyboard.handler";
import { navigateResults } from "../../features/spotlight/components/result-item.component";
import {
  openSwitcher,
  closeSwitcher,
} from "../../features/tab-switcher/components/switcher.component";
import {
  updateSelection,
} from "../../features/tab-switcher/actions/selection.actions";
import { getTabItemsCount } from "../../features/tab-switcher/state/selection.store";
import { config } from "../../core/config/config";
import { getSearchInput } from "../../features/spotlight/utils/spotlight.dom";
import { getHostRoot } from "../../core/utils/host.utils";

let lastDomTabShortcutAt = 0;
const COMMAND_DEDUP_WINDOW_MS = 1000;

function blurFocusedFrame(): void {
  const root = getHostRoot();
  const candidates = [document.activeElement, root?.activeElement];
  for (const el of candidates) {
    if (el && el.tagName === "IFRAME") {
      (el as HTMLElement).blur();
      return;
    }
  }
}

export function openOrCycleTabSwitcher(isReverse: boolean): void {
  if (config.isSpotlightOpen || !config.isTabEnabled) return;

  if (!config.isTabOpen) {
    config.isTabOpen = true;
    openSwitcher(isReverse);
    blurFocusedFrame();
    return;
  }

  const tabsLen = getTabItemsCount();
  const nextIndex = isReverse
    ? (config.tabSelectedIndex - 1 + tabsLen) % tabsLen
    : (config.tabSelectedIndex + 1) % tabsLen;
  updateSelection(nextIndex);
}

export function handleTabSwitcherCommand(isReverse: boolean): void {
  if (performance.now() - lastDomTabShortcutAt < COMMAND_DEDUP_WINDOW_MS) {
    return;
  }
  openOrCycleTabSwitcher(isReverse);
}

function handleTabShortcut(e: KeyboardEvent, isSpotlightOpen: boolean): boolean {
  const isModifier = e.metaKey || e.ctrlKey;

  if (
    isModifier &&
    e.code === "Space" &&
    !isSpotlightOpen &&
    config.isTabEnabled
  ) {
    e.preventDefault();
    lastDomTabShortcutAt = performance.now();
    openOrCycleTabSwitcher(e.shiftKey);
    return true;
  }

  return false;
}

function handleSpotlightKeys(e: KeyboardEvent): void {
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
}

function handleOverlayEscape(
  e: KeyboardEvent,
  isTabOpen: boolean,
  isGlanceOpen: boolean,
): boolean {
  if (isTabOpen && e.key === "Escape") {
    e.preventDefault();
    closeSwitcher();
    return true;
  }

  if (isGlanceOpen && e.key === "Escape") {
    e.stopImmediatePropagation();
    e.preventDefault();
    hideGlance();
    return true;
  }

  return false;
}

export function handleGlobalKeys(e: KeyboardEvent): void {
  try {
    const isSpotlightOpen = config.isSpotlightOpen;
    const isTabOpen = config.isTabOpen;
    const isGlanceOpen = config.isGlanceOpen;

    if (handleTabShortcut(e, isSpotlightOpen)) return;

    // Spotlight is the topmost overlay when open, so it consumes its keys first
    // (even when stacked above Glance).
    if (isSpotlightOpen) {
      handleSpotlightKeys(e);
      return;
    }

    if (handleOverlayEscape(e, isTabOpen, isGlanceOpen)) return;
  } catch (err) {
    // biome-ignore lint/suspicious/noConsole: diagnostic logging
    console.error("handleGlobalKeys error:", err);
  }
}
