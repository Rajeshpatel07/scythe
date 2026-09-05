import type {
  MessageAction,
  MessagePayload,
} from "../core/messaging/message.types";
import {
  handleGetHighResFavicon,
  handleGetFavicon,
} from "./handlers/favicon.handler";
import { handleOpenGlance } from "./handlers/glance.handler";
import { handleCloseGlance } from "./handlers/glance.handler";
import { handleCloseGlanceFromFrame } from "./handlers/glance.handler";
import { handleGetGlanceUrl } from "./handlers/glance.handler";
import { handleClearSW } from "./handlers/glance.handler";
import {
  handleGetHistory,
  handleSearchHistory,
} from "./handlers/history.handler";
import { handleCreateTab } from "./handlers/tab-create.handler";
import { handleGetTabs, handleSwitchTab } from "./handlers/tabs.handler";

export type MessageHandler = (
  request: MessagePayload,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: unknown) => void,
) => boolean | undefined;

const messageHandlers: Partial<Record<MessageAction, MessageHandler>> = {
  getTabs: handleGetTabs,
  switchTab: handleSwitchTab,
  getHistory: handleGetHistory,
  searchHistory: handleSearchHistory,
  getFavicon: handleGetFavicon,
  getHighResFavicon: handleGetHighResFavicon,
  createTab: handleCreateTab,
  openGlance: handleOpenGlance,
  clearSW: handleClearSW,
  closeGlanceFromFrame: handleCloseGlanceFromFrame,
  closeGlance: handleCloseGlance,
  getGlanceUrl: handleGetGlanceUrl,
};

export function routeMessage(
  request: MessagePayload,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: unknown) => void,
): boolean | undefined {
  const handler = messageHandlers[request.action];
  if (!handler) return undefined;
  return handler(request, sender, sendResponse);
}
