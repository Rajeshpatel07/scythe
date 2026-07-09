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

export async function initializeConfig() {
  await new Promise<void>(async (resolve, _reject) => {
    try {
      const newtab = await storage.sync.get<boolean>(["shownewtab"]);
      config.hideNewTab = newtab.shownewtab;

      const searchEngine = await storage.sync.get<string>(["searchEngine"]);
      config.searchEngine = searchEngine.searchEngine;

      const spotlight = await storage.sync.get<boolean>(["isSpotlightEnabled"]);
      config.isSpotlightEnabled = spotlight.isSpotlightEnabled;

      const tabs = await storage.sync.get<boolean>(["isTabEnabled"]);
      config.isTabEnabled = tabs.isTabEnabled;

      const glance = await storage.sync.get<boolean>(["isGlanceEnabled"]);
      config.isGlanceEnabled = glance.isGlanceEnabled;

      resolve();
    } catch (_e) {
      _reject();
    }
  });
}
