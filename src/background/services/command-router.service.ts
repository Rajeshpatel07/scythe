import type { CommandAction } from "../../core/messaging/message.types";
import { toPageAction } from "../../core/messaging/message.types";

export function sendToActiveTab(payload: {
  action: CommandAction;
  reverse?: boolean;
}): void {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab?.id) return;

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
  });
}

export function handleCommand(command: string): void {
  if (command === "toggle-spotlight") {
    sendToActiveTab({ action: "toggleSpotlight" });
  } else if (command === "toggle-tab-switcher") {
    sendToActiveTab({ action: "toggleTabSwitcher", reverse: false });
  } else if (command === "toggle-tab-switcher-reverse") {
    sendToActiveTab({ action: "toggleTabSwitcher", reverse: true });
  }
}
