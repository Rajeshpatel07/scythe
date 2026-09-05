import type {
  FaviconResponse,
  SuccessResponse,
} from "./message.types";

export function ok(): SuccessResponse {
  return { success: true };
}

export function fail(): SuccessResponse {
  return { success: false };
}

export function faviconError(): FaviconResponse {
  return { status: "error", dataUrl: null };
}
