import { config } from "../config";

export function createModelUI() {
  const host = document.createElement("div");
  host.id = "spotlight-host";
  host.setAttribute("style", "position:fixed;bottom:0;right:0;z-index:9999;");
  document.body.appendChild(host);
  const shadowRoot = host.attachShadow({ mode: "open" });
  const stylesheetLink = document.createElement("link");
  stylesheetLink.setAttribute("rel", "stylesheet");
  stylesheetLink.setAttribute("href", chrome.runtime.getURL("src/style.css"));
  shadowRoot.appendChild(stylesheetLink);

  const overlay = document.createElement("div");
  overlay.id = "spotlight-overlay-ext";

  const modal = document.createElement("div");
  modal.id = "spotlight-modal-ext";

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
  searchInput.id = "spotlight-search-input-ext";
  searchInput.type = "text";
  searchInput.placeholder = "Search or enter address";
  searchInput.autocomplete = "off";

  const suggestionEl = document.createElement("div");
  suggestionEl.id = "spotlight-suggestion-ext";

  inputWrapper.appendChild(searchInput);
  inputWrapper.appendChild(suggestionEl);
  searchContainer.appendChild(inputWrapper);

  const resultsList = document.createElement("ul");
  resultsList.id = "spotlight-results-ext";

  modal.appendChild(searchContainer);
  modal.appendChild(resultsList);
  overlay.appendChild(modal);
  shadowRoot.appendChild(overlay);

  forceFocusOnInput(searchInput);
}

export function hideSpotlight() {
  const host = document.getElementById("spotlight-host");

  if (host) {
    setTimeout(() => {
      config.isModelOpen = false;
      host.remove();
    }, 200);
  }
}

function forceFocusOnInput(inputElement: HTMLInputElement) {
  inputElement.focus();

  if (document.activeElement !== inputElement) {
    const focusInterval = setInterval(() => {
      inputElement.focus();
      if (document.activeElement === inputElement) {
        clearInterval(focusInterval);
      }
    }, 50);

    setTimeout(() => clearInterval(focusInterval), 500);
  }
}
