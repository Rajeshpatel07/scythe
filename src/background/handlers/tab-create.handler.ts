import type { MessagePayload } from "../../core/messaging/message.types";
import { fail } from "../../core/messaging/protocol";

type SendResponse = (response?: unknown) => void;

const TAB_LOAD_TIMEOUT_MS = 5000;

export function handleCreateTab(
  request: MessagePayload,
  _sender: chrome.runtime.MessageSender,
  sendResponse: SendResponse,
): boolean {
  if (!request.url) {
    sendResponse(fail());
    return true;
  }

  chrome.tabs
    .create({
      url: request.url,
      active: request.active,
    })
    .then((tab) => {
      const tabId = tab.id;
      if (tabId === undefined) {
        sendResponse({ success: false, tabId: undefined });
        return;
      }

      if (request.active) {
        sendResponse({ success: true, tabId: tabId });
        return;
      }

      let resolved = false;
      const listener = (
        updatedTabId: number,
        changeInfo: { status?: string },
      ) => {
        if (updatedTabId === tabId && changeInfo.status === "complete") {
          cleanup();
          if (!resolved) {
            resolved = true;
            sendResponse({ success: true, tabId: tabId });
          }
        }
      };

      const timeoutId = setTimeout(() => {
        cleanup();
        if (!resolved) {
          resolved = true;
          sendResponse({ success: true, tabId: tabId });
        }
      }, TAB_LOAD_TIMEOUT_MS);

      const cleanup = () => {
        chrome.tabs.onUpdated.removeListener(listener);
        clearTimeout(timeoutId);
      };

      chrome.tabs.onUpdated.addListener(listener);
    })
    .catch(() => {
      sendResponse({ success: false, tabId: undefined });
    });
  return true;
}
