chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-spotlight") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "toggleSpotlight" },
          (_response) => {
            if (chrome.runtime.lastError) {
            }
          },
        );
      }
    });
  }
});

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === "getHistory") {
    chrome.history.search(
      { text: "", startTime: 0, maxResults: 50 },
      (historyItems) => {
        sendResponse({ history: historyItems });
      },
    );
    return true;
  } else if (request.action === "searchHistory") {
    chrome.history.search(
      { text: request.query, startTime: 0, maxResults: 8 },
      (historyItems) => {
        sendResponse({ history: historyItems });
      },
    );
    return true;
  } else if (request.action === "getFavicon") {
    const pageUrl = request.url;

    const faviconUrl = `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(pageUrl)}&size=32`;

    fetch(faviconUrl)
      .then((response) => {
        if (!response.ok) {
          throw Error(" Failed to fetch favicon ");
        }
        return response.blob();
      })
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          sendResponse({ status: "success", dataUrl: reader.result });
        };
        reader.readAsDataURL(blob);
      })
      .catch(() => {
        sendResponse({ status: "error", dataUrl: null });
      });
    return true;
  }
});
