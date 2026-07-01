import { config } from "../config/config";
import {
  LOCALHOST_REGEX,
  LIKELY_URL_REGEX,
  IP_URL_REGEX,
  HAS_PROTOCOL_REGEX,
} from "../config/constants";

export function getSearchUrl(input: string): string {
  const encodedInput = encodeURIComponent(input);
  switch (config.searchEngine) {
    case "DuckDuckGo":
      return `https://duckduckgo.com/?q=${encodedInput}`;
    case "Brave":
      return `https://search.brave.com/search?q=${encodedInput}`;
    case "Bing":
      return `https://www.bing.com/search?q=${encodedInput}`;
    case "Unduck":
      return `https://unduck.link?q=${encodedInput}`;
    default:
      return `https://www.google.com/search?q=${encodedInput}`;
  }
}

export function resolveUrl(input: string): string {
  const trimmedInput = input.trim();
  const hasProtocol = HAS_PROTOCOL_REGEX.test(trimmedInput);

  if (LOCALHOST_REGEX.test(trimmedInput)) {
    return hasProtocol ? trimmedInput : `http://${trimmedInput}`;
  }

  if (LIKELY_URL_REGEX.test(trimmedInput) || IP_URL_REGEX.test(trimmedInput)) {
    return hasProtocol ? trimmedInput : `https://${trimmedInput}`;
  }

  return getSearchUrl(trimmedInput);
}

export function openUrl(url: string, newTab = false): void {
  if (newTab) {
    window.open(url, "_blank");
  } else {
    window.location.href = url;
  }
}
