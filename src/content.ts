import { handleGlobalKeys } from "./events/keyboard";
import { config } from "./config/config.ts";
import { getShadowHost } from "./utils/dom";
import { handleWebSearch } from "./browser/search.ts";

window.addEventListener("keydown", handleGlobalKeys, true);
window.addEventListener(
  "keyup",
  (e: KeyboardEvent) => {
    const shadowHost = getShadowHost();
    if (shadowHost && e.composedPath().includes(shadowHost)) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  },
  { capture: true }
);

chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
  if (request.action === "toggleSpotlight") {
    if (!config.isModelOpen) showSpotlight();
  }
});

function showSpotlight() {
  config.openNewtab = true;
  config.isModelOpen = true;
  handleWebSearch();
}
