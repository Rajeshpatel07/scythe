import type { MessagePayload } from "../../core/messaging/message.types";
import { failResponse, okResponse } from "../../core/messaging/protocol";

type SendResponse = (response?: unknown) => void;

export function handleGetTabs(
  _request: MessagePayload,
  sender: chrome.runtime.MessageSender,
  sendResponse: SendResponse,
): boolean {
  const windowId = sender.tab?.windowId;
  // Extension pages (e.g. the newtab page) broadcast via
  // runtime.sendMessage, so sender.tab is absent. Query without a
  // windowId filter in that case instead of passing an undefined value.
  chrome.tabs.query(windowId ? { windowId } : {}, (tabs) => {
    sendResponse({ tabs: tabs });
  });
  return true;
}

const NUMERIC_TAB_ID = /^\d+$/;

export function handleSwitchTab(
  request: MessagePayload,
  _sender: chrome.runtime.MessageSender,
  sendResponse: SendResponse,
): boolean {
  if (!request.id || !NUMERIC_TAB_ID.test(request.id)) {
    sendResponse(failResponse());
    return true;
  }

  chrome.tabs.update(parseInt(request.id, 10), { active: true }).then(
    () => sendResponse(okResponse()),
    () => sendResponse(failResponse()),
  );
  return true;
}
