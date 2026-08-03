import { storage } from "../storage/storage.utils";
import type { ConfigState } from "../types/config.types";

function createConfig(): ConfigState {
  const state: ConfigState = {
    selectedResultIndex: -1,
    currentSuggestion: "",
    isSpotlightOpen: false,
    openInNewTab: false,
    searchEngine: "google",
    hideNewTab: false,
    isTabOpen: false,
    tabSelectedIndex: 0,
    isGlanceOpen: false,
    isSpotlightEnabled: true,
    isTabEnabled: true,
    isGlanceEnabled: true,
  };

  return state;
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

let storageListenerAdded = false;

if (
  typeof chrome !== "undefined" &&
  chrome.storage &&
  chrome.storage.onChanged
) {
  if (!storageListenerAdded) {
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
    storageListenerAdded = true;
  }
}
