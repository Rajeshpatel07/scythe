import type { MessagePayload } from "../../core/messaging/message.types";

type SendResponse = (response?: unknown) => void;

function searchBrowserHistory(
  text: string,
  maxResults: number,
): Promise<chrome.history.HistoryItem[]> {
  return new Promise((resolve) => {
    chrome.history.search({ text, startTime: 0, maxResults }, (items) => {
      resolve(items);
    });
  });
}

export function handleGetHistory(
  request: MessagePayload,
  _sender: chrome.runtime.MessageSender,
  sendResponse: SendResponse,
): boolean {
  searchBrowserHistory("", request.maxResults || 50).then((historyItems) => {
    sendResponse({ history: historyItems });
  });
  return true;
}

export function handleSearchHistory(
  request: MessagePayload,
  _sender: chrome.runtime.MessageSender,
  sendResponse: SendResponse,
): boolean {
  searchBrowserHistory(request.query || "", request.maxResults || 8).then(
    (historyItems) => {
      sendResponse({ history: historyItems });
    },
  );
  return true;
}
