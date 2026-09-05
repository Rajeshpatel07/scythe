import type { MessagePayload } from "../core/messaging/message.types";
import { installGlanceHeaderRules } from "./services/rules.service";
import { handleBrowserCommand } from "./services/command-router.service";
import {
  handleTabRemoved,
  onGlanceSubFrameNavigation,
} from "./handlers/glance.handler";
import { routeMessage } from "./router";

chrome.webNavigation.onCommitted.addListener(onGlanceSubFrameNavigation);
chrome.webNavigation.onHistoryStateUpdated.addListener(
  onGlanceSubFrameNavigation,
);
chrome.webNavigation.onReferenceFragmentUpdated.addListener(
  onGlanceSubFrameNavigation,
);

chrome.tabs.onRemoved.addListener(handleTabRemoved);

chrome.runtime.onInstalled.addListener(() => {
  installGlanceHeaderRules();
});

chrome.commands.onCommand.addListener(handleBrowserCommand);

chrome.runtime.onMessage.addListener(
  (
    request: MessagePayload,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: unknown) => void,
  ) => routeMessage(request, sender, sendResponse),
);
