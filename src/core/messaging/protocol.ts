import type {
  CreateTabResponse,
  FaviconResponse,
  SuccessResponse,
} from "./message.types";

export function okResponse(): SuccessResponse {
  return { success: true };
}

export function failResponse(): SuccessResponse {
  return { success: false };
}

export function createTabResponse(
  success: boolean,
  tabId?: number,
): CreateTabResponse {
  return { success, tabId };
}

export function faviconError(): FaviconResponse {
  return { status: "error", dataUrl: null };
}
