import type { MessagePayload } from "../../core/messaging/message.types";
import { fail, ok } from "../../core/messaging/protocol";

type SendResponse = (response?: unknown) => void;

const glanceUrlByTab = new Map<number, string>();

export function onGlanceSubFrameNavigation(
  details: chrome.webNavigation.WebNavigationTransitionCallbackDetails,
): void {
  if (details.frameId === 0) return;
  const storedUrl = glanceUrlByTab.get(details.tabId);
  if (!storedUrl) return;

  let origin: string | null = null;
  try {
    origin = details.url ? new URL(details.url).origin : null;
  } catch {
    return;
  }
  if (!origin) return;

  let storedOrigin: string | null = null;
  try {
    storedOrigin = new URL(storedUrl).origin;
  } catch {
    // Ignore invalid stored URLs
  }

  if (storedOrigin && origin === storedOrigin) {
    glanceUrlByTab.set(details.tabId, details.url);
  }

  // Re-clear service workers for this origin — sites like bun.com re-register
  // a SW after the initial clear, so in-iframe navigations would otherwise
  // be served from the SW cache with the original blocking headers.
  chrome.browsingData.removeServiceWorkers({ origins: [origin] }, () => {
    void chrome.runtime.lastError;
  });
}

export function handleTabRemoved(tabId: number): void {
  glanceUrlByTab.delete(tabId);
}

export function handleOpenGlance(
  request: MessagePayload,
  sender: chrome.runtime.MessageSender,
  sendResponse: SendResponse,
): undefined {
  if (request.url && sender.tab?.id) {
    glanceUrlByTab.set(sender.tab.id, request.url);
  }
  sendResponse(ok());
}

export function handleClearSW(
  request: MessagePayload,
  _sender: chrome.runtime.MessageSender,
  sendResponse: SendResponse,
): boolean {
  if (!request.url) {
    sendResponse(fail());
    return true;
  }
  try {
    const origin = new URL(request.url).origin;
    chrome.browsingData.removeServiceWorkers({ origins: [origin] }, () =>
      sendResponse(ok()),
    );
  } catch {
    sendResponse(fail());
  }
  return true;
}

export function handleCloseGlanceFromFrame(
  _request: MessagePayload,
  sender: chrome.runtime.MessageSender,
  sendResponse: SendResponse,
): undefined {
  if (sender.tab?.id) {
    chrome.tabs.sendMessage(
      sender.tab.id,
      { action: "closeGlanceFromFrame" },
      () => void chrome.runtime.lastError,
    );
  }
  sendResponse(ok());
}

export function handleCloseGlance(
  _request: MessagePayload,
  sender: chrome.runtime.MessageSender,
  sendResponse: SendResponse,
): undefined {
  if (sender.tab?.id) {
    glanceUrlByTab.delete(sender.tab.id);
  }
  sendResponse(ok());
}

export function handleGetGlanceUrl(
  _request: MessagePayload,
  sender: chrome.runtime.MessageSender,
  sendResponse: SendResponse,
): undefined {
  if (sender.tab?.id && glanceUrlByTab.has(sender.tab.id)) {
    sendResponse({ url: glanceUrlByTab.get(sender.tab.id) });
  } else {
    sendResponse({ url: null });
  }
}
