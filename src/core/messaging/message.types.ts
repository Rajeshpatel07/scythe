import type { HistoryResponse, TabsResponse } from "../types/domain.types";

export type MessageAction =
  | "toggleSpotlight"
  | "getTabs"
  | "switchTab"
  | "getHistory"
  | "searchHistory"
  | "getFavicon"
  | "createTab";

export interface MessagePayload {
  action: MessageAction;
  id?: string;
  query?: string;
  maxResults?: number;
  url?: string;
  size?: number;
}

export interface FaviconResponse {
  status: "success" | "error";
  dataUrl: string | null;
}

export type MessageResponseType<T extends MessageAction> = T extends "getTabs"
  ? TabsResponse
  : T extends "getHistory"
    ? HistoryResponse
    : T extends "searchHistory"
      ? HistoryResponse
      : T extends "getFavicon"
        ? FaviconResponse
        : T extends "createTab"
          ? { success: true }
          : undefined;
