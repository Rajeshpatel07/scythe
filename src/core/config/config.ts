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

const SYNC_KEYS = [
  "showNewTab",
  "searchEngine",
  "isSpotlightEnabled",
  "isTabEnabled",
  "isGlanceEnabled",
] as const;

type SyncKey = (typeof SYNC_KEYS)[number];

function applySyncValue(key: SyncKey, value: unknown): void {
  switch (key) {
    case "showNewTab":
      if (typeof value === "boolean") config.hideNewTab = value;
      break;
    case "searchEngine":
      if (typeof value === "string") {
        config.searchEngine = value.toLowerCase();
      } else if (value !== undefined) {
        config.searchEngine = "google";
      }
      break;
    case "isSpotlightEnabled":
      if (typeof value === "boolean") config.isSpotlightEnabled = value;
      break;
    case "isTabEnabled":
      if (typeof value === "boolean") config.isTabEnabled = value;
      break;
    case "isGlanceEnabled":
      if (typeof value === "boolean") config.isGlanceEnabled = value;
      break;
  }
}

function applySyncValues(values: Record<string, unknown>): void {
  for (const key of SYNC_KEYS) {
    if (values[key] !== undefined) {
      applySyncValue(key, values[key]);
    }
  }
}

export async function initializeConfig(): Promise<void> {
  try {
    const result = await storage.sync.get([...SYNC_KEYS]);
    applySyncValues(result);
  } catch {
    // Storage unavailable; defaults remain
  }
}

if (
  typeof chrome !== "undefined" &&
  chrome.storage &&
  chrome.storage.onChanged
) {
  chrome.storage.onChanged.addListener(
    (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
      if (areaName !== "sync") return;
      for (const key of SYNC_KEYS) {
        const change = changes[key];
        if (change !== undefined) {
          applySyncValue(key, change.newValue);
        }
      }
    },
  );
}
