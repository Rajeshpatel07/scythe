import { storage } from "../storage/storage.utils";
import type { ConfigState } from "../types/config.types";

function createConfig(): ConfigState {
  const state: ConfigState = {
    selectedResultIndex: -1,
    currentSuggestion: "",
    isSpotlightOpen: false,
    openNewtab: false,
    searchEngine: "google",
    hideNewTab: false,
    isTabOpen: false,
    tabSelectedIndex: 0,
    modifierPressed: false,
    isGlanceOpen: false,
    isSpotlightEnabled: true,
    isTabEnabled: true,
    isGlanceEnabled: true,
  };

  return new Proxy(state, {
    set(target, key: keyof ConfigState, value) {
      const oldValue = target[key];
      target[key] = value as never;

      if (key === "isTabOpen" && value === false && oldValue === true) {
        target.modifierPressed = false;
      }

      return true;
    },
  }) as ConfigState;
}

export const config = createConfig();

export async function initializeConfig(): Promise<void> {
  try {
    const result = await storage.sync.get<boolean | string>([
      "showNewTab",
      "searchEngine",
      "isSpotlightEnabled",
      "isTabEnabled",
      "isGlanceEnabled",
    ]);

    if (result.showNewTab !== undefined)
      config.hideNewTab = result.showNewTab as boolean;
    config.searchEngine =
      (result.searchEngine as string)?.toLowerCase() ?? "google";
    if (result.isSpotlightEnabled !== undefined)
      config.isSpotlightEnabled = result.isSpotlightEnabled as boolean;
    if (result.isTabEnabled !== undefined)
      config.isTabEnabled = result.isTabEnabled as boolean;
    if (result.isGlanceEnabled !== undefined)
      config.isGlanceEnabled = result.isGlanceEnabled as boolean;
  } catch {
    // Storage unavailable; defaults remain
  }
}

if (
  typeof chrome !== "undefined" &&
  chrome.storage &&
  chrome.storage.onChanged
) {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "sync") {
      if (changes.showNewTab !== undefined) {
        config.hideNewTab = changes.showNewTab.newValue as boolean;
      }
      if (changes.searchEngine !== undefined) {
        config.searchEngine = (
          changes.searchEngine.newValue as string
        )?.toLowerCase();
      }
      if (changes.isSpotlightEnabled !== undefined) {
        config.isSpotlightEnabled = changes.isSpotlightEnabled
          .newValue as boolean;
      }
      if (changes.isTabEnabled !== undefined) {
        config.isTabEnabled = changes.isTabEnabled.newValue as boolean;
      }
      if (changes.isGlanceEnabled !== undefined) {
        config.isGlanceEnabled = changes.isGlanceEnabled.newValue as boolean;
      }
    }
  });
}
