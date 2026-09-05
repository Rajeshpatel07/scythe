import type { HistoryResponse, TabsResponse } from "../types/domain.types";

export type MessageAction =
  | "toggleSpotlight"
  | "toggleSpotlightPage"
  | "getTabs"
  | "switchTab"
  | "getHistory"
  | "searchHistory"
  | "getFavicon"
  | "getHighResFavicon"
  | "createTab"
  | "clearSW"
  | "openGlance"
  | "closeGlance"
  | "closeGlanceFromFrame"
  | "getGlanceUrl"
  | "toggleTabSwitcher"
  | "toggleTabSwitcherPage";

export interface MessagePayload {
  action: MessageAction;
  id?: string;
  query?: string;
  maxResults?: number;
  url?: string;
  size?: number;
  active?: boolean;
  reverse?: boolean;
}

interface ToggleSpotlightPayload {
  action: "toggleSpotlight";
}

interface ToggleSpotlightPagePayload {
  action: "toggleSpotlightPage";
}

interface GetTabsPayload {
  action: "getTabs";
}

interface SwitchTabPayload {
  action: "switchTab";
  id: string;
}

interface GetHistoryPayload {
  action: "getHistory";
  maxResults?: number;
}

interface SearchHistoryPayload {
  action: "searchHistory";
  query: string;
  maxResults?: number;
}

interface GetFaviconPayload {
  action: "getFavicon";
  url: string;
  size?: number;
}

interface GetHighResFaviconPayload {
  action: "getHighResFavicon";
  url: string;
}

interface CreateTabPayload {
  action: "createTab";
  url?: string;
  active?: boolean;
}

interface ClearSwPayload {
  action: "clearSW";
  url: string;
}

interface OpenGlancePayload {
  action: "openGlance";
  url: string;
}

interface CloseGlancePayload {
  action: "closeGlance";
}

interface CloseGlanceFromFramePayload {
  action: "closeGlanceFromFrame";
}

interface GetGlanceUrlPayload {
  action: "getGlanceUrl";
}

interface ToggleTabSwitcherPayload {
  action: "toggleTabSwitcher";
  reverse?: boolean;
}

interface ToggleTabSwitcherPagePayload {
  action: "toggleTabSwitcherPage";
  reverse?: boolean;
}

export type NarrowedPayload =
  | ToggleSpotlightPayload
  | ToggleSpotlightPagePayload
  | GetTabsPayload
  | SwitchTabPayload
  | GetHistoryPayload
  | SearchHistoryPayload
  | GetFaviconPayload
  | GetHighResFaviconPayload
  | CreateTabPayload
  | ClearSwPayload
  | OpenGlancePayload
  | CloseGlancePayload
  | CloseGlanceFromFramePayload
  | GetGlanceUrlPayload
  | ToggleTabSwitcherPayload
  | ToggleTabSwitcherPagePayload;

export type CommandAction = "toggleSpotlight" | "toggleTabSwitcher";

export type PageAction = "toggleSpotlightPage" | "toggleTabSwitcherPage";

export function toPageAction(action: CommandAction): PageAction {
  switch (action) {
    case "toggleSpotlight":
      return "toggleSpotlightPage";
    case "toggleTabSwitcher":
      return "toggleTabSwitcherPage";
  }
}

export interface FaviconResponse {
  status: "success" | "error";
  dataUrl: string | null;
}

export interface SuccessResponse {
  success: boolean;
}

export interface CreateTabResponse {
  success: boolean;
  tabId?: number;
}

export interface GlanceUrlResponse {
  url: string | null;
}

export type MessageResponseType<T extends MessageAction> = T extends "getTabs"
  ? TabsResponse
  : T extends "getHistory"
    ? HistoryResponse
    : T extends "searchHistory"
      ? HistoryResponse
      : T extends "getFavicon"
        ? FaviconResponse
        : T extends "getHighResFavicon"
          ? FaviconResponse
          : T extends "createTab"
            ? CreateTabResponse
            : T extends "getGlanceUrl"
              ? GlanceUrlResponse
              : T extends
                    | "switchTab"
                    | "openGlance"
                    | "closeGlance"
                    | "closeGlanceFromFrame"
                    | "clearSW"
                ? SuccessResponse
                : undefined;
