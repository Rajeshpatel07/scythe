import { config } from "../config";
import { hideSpotlight } from "../ui/model";
import { handleSearchSubmit } from "../browser/search";
import { navigateResults } from "../ui/list";

export function handleGlobalKeys(e: KeyboardEvent) {
  const shadowHost = document.getElementById("spotlight-host");
  const shadowRoot = shadowHost?.shadowRoot;
  if (!shadowRoot) return;

  const searchInput = shadowRoot.getElementById(
    "spotlight-search-input-ext",
  ) as HTMLInputElement;
  if (document.activeElement !== searchInput) {
    if (e.key.length === 1 || e.key === "Backspace") {
      searchInput.focus();
    }
  }

  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
    e.preventDefault();
    navigateResults(e.key);
  } else if (e.key === "Enter") {
    e.preventDefault();
    const selectedItem = shadowRoot.querySelector(
      ".spotlight-result-item-ext.selected",
    ) as HTMLLIElement;
    if (selectedItem) {
      selectedItem.click();
    } else {
      handleSearchSubmit();
    }
  } else if (e.key === "Tab" && config.currentSuggestion) {
    e.preventDefault();
    searchInput.value = config.currentSuggestion;
    const reslutList = shadowRoot.getElementById(
      "spotlight-suggestion-ext",
    ) as HTMLUListElement;
    reslutList.innerText = "";
    config.currentSuggestion = "";
  } else if (e.key === "Escape") {
    e.preventDefault();
    hideSpotlight();
  }

  if (shadowHost && e.composedPath().includes(shadowHost)) {
    e.stopImmediatePropagation();

    if (
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      (e.ctrlKey &&
        (e.key === "v" ||
          e.key === "c" ||
          e.key === "Backspace" ||
          e.key === "ArrowLeft" ||
          e.key === "ArrowRight"))
    ) {
      return;
    }
    e.preventDefault();

    if (searchInput && e.key.length === 1) {
      const start = searchInput.selectionStart;
      const end = searchInput.selectionEnd;
      const text = searchInput.value;

      if (start == null || end == null) return;

      searchInput.value =
        text.substring(0, start) + e.key + text.substring(end);
      searchInput.selectionStart = searchInput.selectionEnd = start + 1;

      searchInput.dispatchEvent(
        new Event("input", { bubbles: true, cancelable: true }),
      );
    } else if (searchInput && e.key === "Backspace") {
      const start = searchInput.selectionStart;
      const end = searchInput.selectionEnd;

      if (start == null || end == null) return;
      if (start === end && start > 0) {
        searchInput.value =
          searchInput.value.substring(0, start - 1) +
          searchInput.value.substring(end);
        searchInput.selectionStart = searchInput.selectionEnd = start - 1;
      } else {
        searchInput.value =
          searchInput.value.substring(0, start) +
          searchInput.value.substring(end);
        searchInput.selectionStart = searchInput.selectionEnd = start;
      }
      if (start !== 0 && end !== 0) {
        searchInput.dispatchEvent(
          new Event("input", { bubbles: true, cancelable: true }),
        );
      }
    }
  }
}
