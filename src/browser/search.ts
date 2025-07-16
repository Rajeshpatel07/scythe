import { config } from "../config";
import { hideSpotlight } from "../ui/model";

export function handleSearchSubmit() {
  const searchInput = document.getElementById(
    "spotlight-search-input-ext",
  ) as HTMLInputElement;

  const input = searchInput.value.trim();

  if (input.length > 0) {
    const isLikelyURL =
      /^(https?:\/\/)?([\w.-]+\.[a-z]{2,})(\/[^\s]*)?$/i.test(input) ||
      /^(?!:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/i.test(input);
    const url = isLikelyURL
      ? input.startsWith("http")
        ? input
        : `https://${input}`
      : `https://duckduckgo.com/?q=${encodeURIComponent(input)}`;
    console.log("Initiated navigation...");
    InitiatePageNavigation(url);
  }
}

export function InitiatePageNavigation(url: string) {
  if (config.openNewtab) {
    hideSpotlight();
    window.open(url);
  } else {
    window.location.href = url;
  }
}
