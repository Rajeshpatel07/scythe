import { config } from "../config";

export function createModelUI() {
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
  document.body.appendChild(overlay);

  // --- Focus Management ---
  // Use a small timeout to ensure the browser is ready to give focus.
  setTimeout(() => {
    searchInput.focus();
  }, 0);
}

export function hideSpotlight() {
  const overlay = document.getElementById("spotlight-overlay-ext");
  if (overlay) {
    overlay.classList.remove("visible");
    // Remove the element after the transition is complete
    setTimeout(() => {
      // Check if the overlay is truly hidden before removing to avoid race conditions
      if (!overlay.classList.contains("visible")) {
        config.isModelOpen = false;
        overlay.remove();
      }
    }, 200);
  }
}
