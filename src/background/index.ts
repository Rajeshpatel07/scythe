import type { MessagePayload } from "../core/messaging/message.types";

const DNR_RULE_ID = 1;

const glanceUrlByTab = new Map<number, string>();

function onGlanceSubFrameNavigation(
  details: chrome.webNavigation.WebNavigationTransitionCallbackDetails,
) {
  if (details.frameId === 0) return;
  const origin = details.url ? new URL(details.url).origin : null;
  if (!origin) return;

  const storedUrl = glanceUrlByTab.get(details.tabId);
  const storedOrigin = storedUrl ? new URL(storedUrl).origin : null;
  if (storedOrigin && origin === storedOrigin) {
    glanceUrlByTab.set(details.tabId, details.url);
  }
}

let webNavigationListenerAdded = false;

async function registerDNRRules() {
  try {
    const existing = await chrome.declarativeNetRequest.getDynamicRules();
    const existingIds = existing.map((r) => r.id);

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: existingIds,
      addRules: [
        {
          id: DNR_RULE_ID,
          priority: 1,
          action: {
            type: "modifyHeaders",
            responseHeaders: [
              { header: "x-frame-options", operation: "remove" },
              { header: "content-security-policy", operation: "remove" },
              {
                header: "content-security-policy-report-only",
                operation: "remove",
              },
            ],
          },
          condition: {
            resourceTypes: [
              "main_frame",
              "sub_frame",
              "xmlhttprequest",
              "other",
            ],
          },
        },
      ],
    });
  } catch {
    // DNR registration failure is non-fatal; iframe may not load
  }
}

registerDNRRules();

chrome.runtime.onInstalled.addListener(registerDNRRules);
chrome.runtime.onStartup.addListener(registerDNRRules);

chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-spotlight") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "toggleSpotlight" },
          (_response) => {
            if (chrome.runtime.lastError) {
              // Ignore error if content script not loaded
            }
          },
        );
      }
    });
  }
});

chrome.runtime.onMessage.addListener(
  (request: MessagePayload, sender, sendResponse) => {
    switch (request.action) {
      case "getTabs":
        chrome.tabs.query({ windowId: sender.tab?.windowId }, (tabs) => {
          sendResponse({ tabs: tabs });
        });
        return true;

      case "switchTab":
        if (request.id) {
          chrome.tabs.update(parseInt(request.id, 10), { active: true });
        }
        return true;

      case "getHistory":
        chrome.history.search(
          { text: "", startTime: 0, maxResults: 50 },
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
        const imgSize = request.size || 32;
        const faviconUrl = `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(pageUrl)}&size=${imgSize}&allowGoogle=true`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        fetch(faviconUrl, { signal: controller.signal })
          .then((response) => {
            if (!response.ok) throw Error("Failed to fetch favicon");
            return response.blob();
          })
          .then((blob) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              clearTimeout(timeoutId);
              sendResponse({ status: "success", dataUrl: reader.result });
            };
            reader.readAsDataURL(blob);
          })
          .catch(() => {
            clearTimeout(timeoutId);
            sendResponse({ status: "error", dataUrl: null });
          });
        return true;
      }

      case "getHighResFavicon": {
        const hostname = request.url;
        if (!hostname) {
          sendResponse({ status: "error", dataUrl: null });
          return true;
        }
        const imgUrl = `https://www.google.com/s2/favicons?sz=128&domain_url=https://${hostname}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        fetch(imgUrl, { signal: controller.signal })
          .then((response) => {
            if (!response.ok) throw Error("Failed to fetch high-res favicon");
            return response.blob();
          })
          .then((blob) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              clearTimeout(timeoutId);
              sendResponse({ status: "success", dataUrl: reader.result as string });
            };
            reader.readAsDataURL(blob);
          })
          .catch(() => {
            clearTimeout(timeoutId);
            sendResponse({ status: "error", dataUrl: null });
          });
        return true;
      }

      case "createTab":
        if (request.url) {
          chrome.tabs.create({ url: request.url, active: true });
          sendResponse({ success: true });
        }
        break;

      case "openGlance":
        if (request.url && sender.tab?.id) {
          glanceUrlByTab.set(sender.tab.id, request.url);
          if (!webNavigationListenerAdded) {
            chrome.webNavigation.onCommitted.addListener(
              onGlanceSubFrameNavigation,
            );
            webNavigationListenerAdded = true;
          }
          sendResponse({ success: true });
        }
        return true;

      case "closeGlance":
        if (sender.tab?.id) {
          glanceUrlByTab.delete(sender.tab.id);
        }
        sendResponse({ success: true });
        return true;

      case "getGlanceUrl":
        if (sender.tab?.id && glanceUrlByTab.has(sender.tab.id)) {
          sendResponse({ url: glanceUrlByTab.get(sender.tab.id) });
        } else {
          sendResponse({ url: null });
        }
        return true;

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
    }
  },
);
