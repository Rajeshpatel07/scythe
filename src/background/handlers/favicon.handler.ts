import type { MessagePayload } from "../../core/messaging/message.types";
import { faviconError } from "../../core/messaging/protocol";
import {
  fetchChromeFaviconDataUrl,
  fetchHighResDataUrl,
} from "../services/favicon-fetch.service";

type SendResponse = (response?: unknown) => void;

export function handleGetFavicon(
  request: MessagePayload,
  _sender: chrome.runtime.MessageSender,
  sendResponse: SendResponse,
): boolean {
  const pageUrl = request.url;
  if (!pageUrl) {
    sendResponse(faviconError());
    return true;
  }
  fetchChromeFaviconDataUrl(pageUrl, request.size || 32).then(sendResponse);
  return true;
}

export function handleGetHighResFavicon(
  request: MessagePayload,
  _sender: chrome.runtime.MessageSender,
  sendResponse: SendResponse,
): boolean {
  const hostname = request.url;
  if (!hostname) {
    sendResponse(faviconError());
    return true;
  }
  fetchHighResDataUrl(hostname).then(sendResponse);
  return true;
}
