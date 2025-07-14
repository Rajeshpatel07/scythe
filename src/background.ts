chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-spotlight") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "toggleSpotlight" },
          (_response) => {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
              console.error("Spotlight: Content script not ready.");
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
      { text: "", startTime: 0, maxResults: 8 },
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
  }
});
