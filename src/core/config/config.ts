import { storage } from "../storage/storage.utils";
import type { ConfigState } from "../types/config.types";

function createConfig(): ConfigState {
  const state: ConfigState = {
    selectedResultIndex: -1,
    currentSuggestion: "",
    isSpotlightOpen: false,
    openNewtab: false,
    searchEngine: "Google",
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

    if (result.showNewTab !== undefined) config.hideNewTab = result.showNewTab as boolean;
    config.searchEngine = (result.searchEngine as string) ?? "Google";
    if (result.isSpotlightEnabled !== undefined) config.isSpotlightEnabled = result.isSpotlightEnabled as boolean;
    if (result.isTabEnabled !== undefined) config.isTabEnabled = result.isTabEnabled as boolean;
    if (result.isGlanceEnabled !== undefined) config.isGlanceEnabled = result.isGlanceEnabled as boolean;
  } catch {
    // Storage unavailable; defaults remain
  }
}
