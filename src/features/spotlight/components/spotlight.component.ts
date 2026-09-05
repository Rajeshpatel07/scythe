import { config } from "../../../core/config/config";
import {
  ensureHost,
  removeHost,
  getHostRoot,
} from "../../../core/utils/host.utils";
import { invalidateHistoryIndex } from "../services/history-index.store";
import { SPOTLIGHT_CLASSES, SPOTLIGHT_IDS } from "../spotlight.constants";

let focusGeneration = 0;

function buildSearchBar(): {
  container: HTMLElement;
  input: HTMLInputElement;
} {
  const searchContainer = document.createElement("div");
  searchContainer.className = "spotlight-search-container-ext";
  searchContainer.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z" stroke="currentColor" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

  const inputWrapper = document.createElement("div");
  inputWrapper.className = "spotlight-input-wrapper-ext";

  const searchInput = document.createElement("input");
  searchInput.id = SPOTLIGHT_IDS.searchInput;
  searchInput.type = "text";
  searchInput.placeholder = "Search or enter address";
  searchInput.autocomplete = "off";
  searchInput.setAttribute("autofocus", "");

  const autocompletionEl = document.createElement("div");
  autocompletionEl.id = SPOTLIGHT_IDS.suggestion;

  inputWrapper.appendChild(searchInput);
  inputWrapper.appendChild(autocompletionEl);
  searchContainer.appendChild(inputWrapper);

  return { container: searchContainer, input: searchInput };
}

function buildResultsList(): HTMLUListElement {
  const resultsList = document.createElement("ul");
  resultsList.id = SPOTLIGHT_IDS.resultsList;
  return resultsList;
}

export function createSpotlightUI(): void {
  const shadowRoot = ensureHost("spotlight");

  const overlay = document.createElement("div");
  overlay.id = "spotlight-overlay-ext";

  const modal = document.createElement("div");
  modal.id = "spotlight-modal-ext";

  const { container: searchContainer, input: searchInput } = buildSearchBar();
  const resultsList = buildResultsList();

  modal.appendChild(searchContainer);
  modal.appendChild(resultsList);
  overlay.appendChild(modal);
  shadowRoot.appendChild(overlay);

  forceFocusOnInput(searchInput);
}

export function hideSpotlight(): void {
  focusGeneration++;
  invalidateHistoryIndex();

  const root = getHostRoot();
  root
    ?.getElementById("spotlight-overlay-ext")
    ?.classList.add(SPOTLIGHT_CLASSES.closing);

  config.isSpotlightOpen = false;
  removeHost("spotlight");
}

function forceFocusOnInput(inputElement: HTMLInputElement) {
  const generation = focusGeneration;

  const tryFocus = () => {
    if (generation !== focusGeneration) return;
    if (!document.hasFocus()) window.focus();
    inputElement.focus({ preventScroll: true });
  };

  tryFocus();
  if (document.activeElement !== inputElement) {
    setTimeout(() => {
      tryFocus();
      requestAnimationFrame(() => {
        if (generation !== focusGeneration) return;
        if (document.activeElement !== inputElement) inputElement.focus();
      });
    }, 50);
  }
}
