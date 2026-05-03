import { config } from "../config/config";

chrome.storage.sync.get(["searchEngine"], (result) => {
  if (result.searchEngine) {
    config.searchEngine = result.searchEngine;
  }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "sync" && changes.searchEngine) {
    config.searchEngine = changes.searchEngine.newValue;
  }
});
