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
    e.preventDefault();

    const inputElement = shadowRoot.getElementById(
      "spotlight-search-input-ext",
    ) as HTMLInputElement;

    if (inputElement && e.key.length === 1) {
      const start = inputElement.selectionStart;
      const end = inputElement.selectionEnd;
      const text = inputElement.value;

      if (start == null || end == null) return;

      inputElement.value =
        text.substring(0, start) + e.key + text.substring(end);
      inputElement.selectionStart = inputElement.selectionEnd = start + 1;

      inputElement.dispatchEvent(
        new Event("input", { bubbles: true, cancelable: true }),
      );
    } else if (inputElement && e.key === "Backspace") {
      const start = inputElement.selectionStart;
      const end = inputElement.selectionEnd;

      if (start == null || end == null) return;
      if (start === end && start > 0) {
        inputElement.value =
          inputElement.value.substring(0, start - 1) +
          inputElement.value.substring(end);
        inputElement.selectionStart = inputElement.selectionEnd = start - 1;
      } else {
        inputElement.value =
          inputElement.value.substring(0, start) +
          inputElement.value.substring(end);
        inputElement.selectionStart = inputElement.selectionEnd = start;
      }
      if (start !== 0 && end !== 0) {
        inputElement.dispatchEvent(
          new Event("input", { bubbles: true, cancelable: true }),
        );
      }
    }
  }
}
