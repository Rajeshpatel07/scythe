import newtabStyle from "./core/styles/newtab.css?raw";
import { createNewTabPage } from "./features/new-tab/components/newtab.component";
import { config, initializeConfig } from "./core/config/config";
import { showSpotlight } from "./features/spotlight/services/spotlight.controller";
import { confirmSelection } from "./features/tab-switcher/actions/selection.actions";
import {
  handleGlobalKeys,
  handleTabSwitcherCommand,
} from "./app/keyboard/global-keys";
import type { MessagePayload } from "./core/messaging/message.types";

chrome.runtime.onMessage.addListener((request: MessagePayload) => {
  // Handle both the extension-page broadcast (toggleTabSwitcherPage) and the
  // tab-scoped action (toggleTabSwitcher) so the newtab page responds to the
  // background regardless of which variant is delivered.
  if (
    request.action === "toggleTabSwitcherPage" ||
    request.action === "toggleTabSwitcher"
  ) {
    handleTabSwitcherCommand(Boolean(request.reverse));
  }
  if (
    request.action === "toggleSpotlightPage" ||
    request.action === "toggleSpotlight"
  ) {
    showSpotlight();
  }
});

window.addEventListener(
  "keyup",
  (e: KeyboardEvent) => {
    if (e.key === "Meta" || e.key === "Control") {
      if (config.isTabOpen) {
        confirmSelection();
      }
      return;
    }
  },
  { capture: true },
);

document.addEventListener("keydown", handleGlobalKeys, { capture: true });
document.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.ctrlKey && e.key === "/") {
    e.preventDefault();
    if (!config.isSpotlightOpen) {
      showSpotlight();
    }
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  await initializeConfig();
  createNewTabPage();
});

function injectCss() {
  // document_start guarantees <head> exists for well-formed Chrome pages, but
  // bail out instead of throwing if a malformed preamble ever lacks one.
  if (!document.head) return;
  const style = document.createElement("style");
  style.textContent = newtabStyle;
  document.head.appendChild(style);
}

injectCss();
