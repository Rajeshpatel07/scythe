import { createModelUI } from "./ui/model";
import { populateHistory } from "./browser/history";
import { updateSuggestion, searchAndSuggest } from "./browser/suggestion";
import { handleGlobalKeys } from "./events/keyboard";
import { createNewTabPage } from "./ui/newtab";
import { config } from "./config";

document.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.ctrlKey && e.key === "/") {
    e.preventDefault();
    if (!config.isModelOpen) {
      showSpotlight();
    }
  }
});

document.addEventListener("DOMContentLoaded", () => {
  createNewTabPage();
  const settingsButton = document.getElementById(
    "spotlight-settings-button",
  ) as HTMLButtonElement;
  const settingsModal = document.getElementById(
    "spotlight-settings-modal",
  ) as HTMLDivElement;
  const closeButton = document.getElementById(
    "spotlight-settings-close-button",
  ) as HTMLButtonElement;
  const overlay = document.getElementById(
    "spotlight-overlay",
  ) as HTMLDivElement;

  function openSettings() {
    settingsModal.classList.add("spotlight-modal-visible");
    overlay.classList.add("spotlight-modal-visible");
  }

  function closeSettings() {
    settingsModal.classList.remove("spotlight-modal-visible");
    overlay.classList.remove("spotlight-modal-visible");
  }

  settingsButton?.addEventListener("click", openSettings);
  closeButton?.addEventListener("click", closeSettings);
  overlay?.addEventListener("click", closeSettings);
  document.addEventListener("keydown", (event) => {
    if (
      settingsModal.classList.contains("spotlight-modal-visible") &&
      event.key === "Escape"
    ) {
      closeSettings();
    }
  });

  // --- Custom Search Engine Dropdown Logic ---
  const engineTrigger = document.getElementById(
    "spotlight-engine-trigger",
  ) as HTMLButtonElement;
  const engineOptionsList = document.getElementById(
    "spotlight-engine-options-list",
  ) as HTMLUListElement;
  const engineOptions = document.querySelectorAll(
    ".spotlight-engine-option-item",

    //@ts-ignore
  ) as NodeListof<HTMLLIElement>;

  // Toggle dropdown visibility
  engineTrigger?.addEventListener("click", () => {
    engineOptionsList.classList.toggle("spotlight-open");
  });

  // Handle selection of an engine
  //@ts-ignore
  engineOptions.forEach((option) => {
    option.addEventListener("click", () => {
      // Get the selected engine's details from the clicked item
      //@ts-ignore
      const selectedValue = option.dataset.value;
      const selectedImgSrc = option.querySelector("img").src;
      const selectedName = option.querySelector("span").textContent;

      // Update the trigger button's content
      const triggerImg = engineTrigger.querySelector("img");
      const triggerSpan = engineTrigger.querySelector("span");
      if (triggerImg && triggerSpan) {
        triggerImg.src = selectedImgSrc;
        triggerImg.alt = selectedName;
        triggerSpan.textContent = selectedName;
      }

      // Close the dropdown
      engineOptionsList.classList.remove("spotlight-open");
    });
  });

  // Close dropdown if clicking outside of it
  document.addEventListener("click", (event: MouseEvent) => {
    if (
      //@ts-ignore
      !engineTrigger?.contains(event.target) &&
      //@ts-ignore
      !engineOptionsList?.contains(event.target)
    ) {
      engineOptionsList?.classList.remove("spotlight-open");
    }
  });
});

export function showSpotlight() {
  config.openNewtab = false;
  config.isModelOpen = true;
  createModelUI();
  const searchInput = document.getElementById(
    "spotlight-search-input-ext",
  ) as HTMLInputElement;

  let debounceTimeout: NodeJS.Timeout;
  searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      const query = searchInput.value.trim();
      updateSuggestion(query);
      if (query.length > 0) {
        searchAndSuggest(query);
      } else {
        populateHistory();
      }
    }, 800);
  });

  document.addEventListener("keydown", handleGlobalKeys);

  populateHistory();
  updateSuggestion("");
}
