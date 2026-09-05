import type {
  CommandAction,
  MessagePayload,
} from "../core/messaging/message.types";
import { toPageAction } from "../core/messaging/message.types";

const RULE_ID = 1;

const glanceUrlByTab = new Map<number, string>();
const pendingHighResFavicon = new Map<
  string,
  Promise<{ status: string; dataUrl: string | null }>
>();

function onGlanceSubFrameNavigation(
  details: chrome.webNavigation.WebNavigationTransitionCallbackDetails,
) {
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

chrome.webNavigation.onCommitted.addListener(onGlanceSubFrameNavigation);
chrome.webNavigation.onHistoryStateUpdated.addListener(
  onGlanceSubFrameNavigation,
);
chrome.webNavigation.onReferenceFragmentUpdated.addListener(
  onGlanceSubFrameNavigation,
);

chrome.tabs.onRemoved.addListener((tabId) => {
  glanceUrlByTab.delete(tabId);
});

async function updateRules() {
  const rule: chrome.declarativeNetRequest.Rule = {
    id: RULE_ID,
    priority: 1,
    action: {
      type: "modifyHeaders",
      responseHeaders: [
        { header: "X-Frame-Options", operation: "remove" },
        { header: "Content-Security-Policy", operation: "remove" },
        { header: "Content-Security-Policy-Report-Only", operation: "remove" },
        { header: "X-Content-Security-Policy", operation: "remove" },
        { header: "X-WebKit-CSP", operation: "remove" },
        { header: "Cross-Origin-Embedder-Policy", operation: "remove" },
        { header: "Cross-Origin-Opener-Policy", operation: "remove" },
        { header: "Cross-Origin-Resource-Policy", operation: "remove" },
        { header: "Permissions-Policy", operation: "remove" },
        { header: "X-Permissions-Policy", operation: "remove" },
        { header: "frame-ancestors", operation: "remove" },
      ],
    },
    condition: {
      urlFilter: "*",
      resourceTypes: ["sub_frame"],
    },
  };

  try {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [RULE_ID],
      addRules: [rule],
    });
  } catch {
    // Rule updates are best-effort; stubborn sites may refuse to embed
  }
}

chrome.runtime.onInstalled.addListener(() => {
  updateRules();
});

function sendToActiveTab(payload: {
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

chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-spotlight") {
    sendToActiveTab({ action: "toggleSpotlight" });
  } else if (command === "toggle-tab-switcher") {
    sendToActiveTab({ action: "toggleTabSwitcher", reverse: false });
  } else if (command === "toggle-tab-switcher-reverse") {
    sendToActiveTab({ action: "toggleTabSwitcher", reverse: true });
  }
});

function buildChromeFaviconUrl(pageUrl: string, imgSize: number): string {
  return `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(pageUrl)}&size=${imgSize}&allowGoogle=true`;
}

function buildHighResFaviconUrl(hostname: string): string {
  return `https://www.google.com/s2/favicons?sz=128&domain_url=https://${hostname}`;
}

async function fetchAsDataUrl(
  url: string,
): Promise<{ status: string; dataUrl: string | null }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw Error();
    const blob = await response.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        clearTimeout(timeoutId);
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject();
        }
      };
      reader.onerror = () => {
        clearTimeout(timeoutId);
        reject();
      };
      reader.readAsDataURL(blob);
    });
    return { status: "success", dataUrl };
  } catch {
    clearTimeout(timeoutId);
    return { status: "error", dataUrl: null };
  }
}

chrome.runtime.onMessage.addListener(
  (request: MessagePayload, sender, sendResponse) => {
    switch (request.action) {
      case "getTabs": {
        const windowId = sender.tab?.windowId;
        // Extension pages (e.g. the newtab page) broadcast via
        // runtime.sendMessage, so sender.tab is absent. Query without a
        // windowId filter in that case instead of passing an undefined value.
        chrome.tabs.query(windowId ? { windowId } : {}, (tabs) => {
          sendResponse({ tabs: tabs });
        });
        return true;
      }

      case "switchTab":
        if (request.id) {
          chrome.tabs.update(parseInt(request.id, 10), { active: true });
        }
        sendResponse({ success: true });
        return;

      case "getHistory":
        chrome.history.search(
          { text: "", startTime: 0, maxResults: request.maxResults || 50 },
          (historyItems) => {
            sendResponse({ history: historyItems });
          },
        );
        return true;

      case "searchHistory":
        chrome.history.search(
          {
            text: request.query || "",
            startTime: 0,
            maxResults: request.maxResults || 8,
          },
          (historyItems) => {
            sendResponse({ history: historyItems });
          },
        );
        return true;

      case "getFavicon": {
        const pageUrl = request.url;
        if (!pageUrl) {
          sendResponse({ status: "error", dataUrl: null });
          return true;
        }
        fetchAsDataUrl(buildChromeFaviconUrl(pageUrl, request.size || 32)).then(
          sendResponse,
        );
        return true;
      }

      case "getHighResFavicon": {
        const hostname = request.url;
        if (!hostname) {
          sendResponse({ status: "error", dataUrl: null });
          return true;
        }
        if (!pendingHighResFavicon.has(hostname)) {
          pendingHighResFavicon.set(
            hostname,
            fetchAsDataUrl(buildHighResFaviconUrl(hostname)).finally(() =>
              pendingHighResFavicon.delete(hostname),
            ),
          );
        }
        pendingHighResFavicon.get(hostname)?.then(sendResponse);
        return true;
      }

      case "createTab":
        if (request.url) {
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
                if (
                  updatedTabId === tabId &&
                  changeInfo.status === "complete"
                ) {
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
              }, 5000);

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
        break;

      case "openGlance":
        if (request.url && sender.tab?.id) {
          glanceUrlByTab.set(sender.tab.id, request.url);
        }
        sendResponse({ success: true });
        return;

      case "clearSW": {
        if (!request.url) {
          sendResponse({ success: false });
          return true;
        }
        try {
          const origin = new URL(request.url).origin;
          chrome.browsingData.removeServiceWorkers({ origins: [origin] }, () =>
            sendResponse({ success: true }),
          );
        } catch {
          sendResponse({ success: false });
        }
        return true;
      }

      case "closeGlanceFromFrame":
        if (sender.tab?.id) {
          chrome.tabs.sendMessage(
            sender.tab.id,
            { action: "closeGlanceFromFrame" },
            () => void chrome.runtime.lastError,
          );
        }
        sendResponse({ success: true });
        return;

      case "closeGlance":
        if (sender.tab?.id) {
          glanceUrlByTab.delete(sender.tab.id);
        }
        sendResponse({ success: true });
        return;

      case "getGlanceUrl":
        if (sender.tab?.id && glanceUrlByTab.has(sender.tab.id)) {
          sendResponse({ url: glanceUrlByTab.get(sender.tab.id) });
        } else {
          sendResponse({ url: null });
        }
        return;
    }
  },
);
