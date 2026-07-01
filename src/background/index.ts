import type { MessagePayload } from "../core/messaging/message.types";

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
  (request: MessagePayload, _sender, sendResponse) => {
    switch (request.action) {
      case "getTabs":
        chrome.tabs.query({}, (tabs) => {
          sendResponse({ tabs: tabs });
        });
        return true;

      case "switchTab":
        if (request.id) {
          chrome.tabs.update(parseInt(request.id), { active: true });
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

      case "createTab":
        if (request.url) {
          chrome.tabs.create({ url: request.url, active: true });
          sendResponse({ success: true });
        }
        break;
    }
  },
);
