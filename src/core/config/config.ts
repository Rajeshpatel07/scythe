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
