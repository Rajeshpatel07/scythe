import type { CommandAction } from "../../core/messaging/message.types";
import { toPageAction } from "../../core/messaging/message.types";

type CommandPayload = {
  action: CommandAction;
  reverse?: boolean;
};

function dispatchToTab(tab: chrome.tabs.Tab, payload: CommandPayload): void {
  if (tab.id === undefined) return;

  const extensionRoot = chrome.runtime.getURL("");
  if (tab.url?.startsWith(extensionRoot)) {
    // Broadcast targeted at extension pages only. Content scripts use the
    // `*Page`-suffixed action so a broadcast never leaks into other tabs.
    chrome.runtime
      .sendMessage({ ...payload, action: toPageAction(payload.action) })
      .catch(() => {
        // Ignore if no extension page is listening (e.g. popup only)
      });
    return;
  }

  chrome.tabs.sendMessage(tab.id, payload, () => {
    // Ignore error if content script not loaded
    void chrome.runtime.lastError;
  });
}

export function sendToTab(
  tab: chrome.tabs.Tab | undefined,
  payload: CommandPayload,
): void {
  // `chrome.commands.onCommand` supplies the active tab. Re-querying from an
  // MV3 service worker with `currentWindow` is ambiguous, so only fall back to
  // a query when the browser did not provide a tab.
  if (tab) {
    dispatchToTab(tab, payload);
    return;
  }

  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    const fallbackTab = tabs[0];
    if (fallbackTab) {
      dispatchToTab(fallbackTab, payload);
    }
  });
}

export function handleBrowserCommand(
  command: string,
  tab?: chrome.tabs.Tab,
): void {
  if (command === "toggle-spotlight") {
    sendToTab(tab, { action: "toggleSpotlight" });
  } else if (command === "toggle-tab-switcher") {
    sendToTab(tab, { action: "toggleTabSwitcher", reverse: false });
  } else if (command === "toggle-tab-switcher-reverse") {
    sendToTab(tab, { action: "toggleTabSwitcher", reverse: true });
  }
}
