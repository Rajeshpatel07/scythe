import { config } from "../../../core/config/config";
import { storage } from "../../../core/storage/storage.utils";
import { createNewTabPage } from "./newtab.component";

export function showSidebar(body: HTMLBodyElement) {
  const header = document.createElement("header");
  header.id = "spotlight-header";

  const settingsButton = document.createElement("button");
  settingsButton.id = "spotlight-settings-button";
  settingsButton.className = "spotlight-icon-button";
  settingsButton.setAttribute("aria-label", "Open settings");
  settingsButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round">
            <path
                d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    `;
  header.appendChild(settingsButton);
  body.appendChild(header);
  // The settings modal panel, hidden by default
  const settingsModal = document.createElement("aside");
  settingsModal.id = "spotlight-settings-modal";

  const settingsHeader = document.createElement("div");
  settingsHeader.className = "spotlight-settings-header";

  const settingsH2 = document.createElement("h2");
  settingsH2.textContent = "Quick settings";
  settingsHeader.appendChild(settingsH2);

  const settingsCloseButton = document.createElement("button");
  settingsCloseButton.id = "spotlight-settings-close-button";
  settingsCloseButton.className = "spotlight-icon-button";
  settingsCloseButton.setAttribute("aria-label", "Close settings");
  settingsCloseButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    `;
  settingsHeader.appendChild(settingsCloseButton);
  settingsModal.appendChild(settingsHeader);

  const settingsContent = document.createElement("div");
  settingsContent.className = "spotlight-settings-content";

  // Search Engine Setting
  const searchEngineSettingItem = sidebarItem(
    "Search engine",
    "Choose your default engine",
  );

  const searchEngineSettingControl = document.createElement("div");
  searchEngineSettingControl.className = "spotlight-setting-control";

  const engines = [
    {
      name: "Google",
      value: "google",
      favicon: "src/assets/search-engine-logos/google.svg",
    },
    {
      name: "DuckDuckGo",
      value: "duckduckgo",
      favicon: "src/assets/search-engine-logos/duckduckgo.svg",
    },
    {
      name: "Brave",
      value: "brave",
      favicon: "src/assets/search-engine-logos/brave.svg",
    },
    {
      name: "Bing",
      value: "bing",
      favicon: "src/assets/search-engine-logos/bing.svg",
    },
    {
      name: "Unduck",
      value: "unduck",
      favicon: "src/assets/search-engine-logos/unduck.png",
    },
  ];

  const engineSelectWrapper = document.createElement("div");
  engineSelectWrapper.className = "spotlight-engine-select-wrapper";

  const engineSelectTrigger = document.createElement("button");
  engineSelectTrigger.className = "spotlight-engine-select-trigger";
  engineSelectTrigger.id = "spotlight-engine-trigger";

  const defaultEngineImg = document.createElement("img");
  const engine = engines.find((e) => config.searchEngine === e.name);

  defaultEngineImg.src = engine
    ? engine.favicon
    : "https://svgl.app/library/google.svg";
  defaultEngineImg.alt = engine ? engine.name : "Google";
  engineSelectTrigger.appendChild(defaultEngineImg);

  const defaultEngineSpan = document.createElement("span");
  defaultEngineSpan.textContent = config.searchEngine || "Google";
  engineSelectTrigger.appendChild(defaultEngineSpan);

  const dropdownArrow = document.createElement("svg");
  dropdownArrow.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  dropdownArrow.setAttribute("width", "16");
  dropdownArrow.setAttribute("height", "16");
  dropdownArrow.setAttribute("viewBox", "0 0 24 24");
  dropdownArrow.setAttribute("fill", "none");
  dropdownArrow.setAttribute("stroke", "currentColor");
  dropdownArrow.setAttribute("stroke-width", "2");
  dropdownArrow.setAttribute("stroke-linecap", "round");
  dropdownArrow.setAttribute("stroke-linejoin", "round");
  dropdownArrow.innerHTML = `<polyline points="6 9 12 15 18 9"></polyline>`;
  engineSelectTrigger.appendChild(dropdownArrow);
  engineSelectWrapper.appendChild(engineSelectTrigger);

  const engineOptionsList = document.createElement("ul");
  engineOptionsList.className = "spotlight-engine-options";
  engineOptionsList.id = "spotlight-engine-options-list";

  engines.forEach((engine) => {
    const optionItem = document.createElement("li");
    optionItem.className = "spotlight-engine-option-item";
    optionItem.setAttribute("data-value", engine.value);

    const img = document.createElement("img");
    img.src = engine.favicon;
    img.alt = engine.name;
    optionItem.appendChild(img);

    const span = document.createElement("span");
    span.textContent = engine.name;
    optionItem.appendChild(span);
    engineOptionsList.appendChild(optionItem);
  });

  const togglePageSettings = sidebarItem(
    "Toggle content",
    "hide the content in new tab.",
  );

  const toggleControl = document.createElement("div");
  toggleControl.className = "spotlight-setting-control";
  toggleControl.style.display = "flex";
  toggleControl.style.alignItems = "center";
  toggleControl.style.justifyContent = "flex-end";

  const switchLabel = document.createElement("label");
  switchLabel.style.position = "relative";
  switchLabel.style.display = "inline-block";
  switchLabel.style.width = "44px";
  switchLabel.style.height = "24px";
  switchLabel.style.flexShrink = "0";
  switchLabel.style.cursor = "pointer";

  const toggleCheckbox = document.createElement("input");
  toggleCheckbox.type = "checkbox";
  toggleCheckbox.id = "spotlight-newtab-toggle";
  toggleCheckbox.style.opacity = "0";
  toggleCheckbox.style.width = "0";
  toggleCheckbox.style.height = "0";
  toggleCheckbox.checked = config.shownewtab;

  const slider = document.createElement("span");
  slider.style.position = "absolute";
  slider.style.top = "0";
  slider.style.left = "0";
  slider.style.right = "0";
  slider.style.bottom = "0";
  slider.style.backgroundColor = config.shownewtab ? "#10b981" : "#52525b";
  slider.style.transition = "background-color 0.25s ease-in-out";
  slider.style.borderRadius = "24px";
  slider.style.boxShadow = "inset 0 1px 2px rgba(0, 0, 0, 0.1)";

  const circle = document.createElement("span");
  circle.style.position = "absolute";
  circle.style.height = "18px";
  circle.style.width = "18px";
  circle.style.left = config.shownewtab ? "23px" : "3px";
  circle.style.bottom = "3px";
  circle.style.backgroundColor = "#ffffff";
  circle.style.transition = "left 0.25s ease-in-out, transform 0.25s ease";
  circle.style.borderRadius = "50%";
  circle.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.3)";

  slider.appendChild(circle);
  switchLabel.appendChild(toggleCheckbox);
  switchLabel.appendChild(slider);
  toggleControl.appendChild(switchLabel);

  toggleCheckbox.onchange = (e) => {
    const isChecked = (e.target as HTMLInputElement).checked;

    slider.style.backgroundColor = isChecked ? "#10b981" : "#52525b";
    circle.style.left = isChecked ? "23px" : "3px";

    if (isChecked) {
      localStorage.setItem("shownewtab", "true");
      config.shownewtab = true;
      hidePage();
    } else {
      const body = document.body as HTMLBodyElement;
      body.innerHTML = "";
      localStorage.setItem("shownewtab", "false");
      config.shownewtab = false;
      createNewTabPage();
      SidebarSettings();
    }
  };

  engineSelectWrapper.appendChild(engineOptionsList);
  searchEngineSettingControl.appendChild(engineSelectWrapper);
  searchEngineSettingItem.appendChild(searchEngineSettingControl);
  settingsContent.appendChild(searchEngineSettingItem);
  togglePageSettings.appendChild(toggleControl);
  settingsContent.appendChild(togglePageSettings);
  settingsModal.appendChild(settingsContent);

  body.appendChild(settingsModal);

  const overlayDiv = document.createElement("div");
  overlayDiv.id = "spotlight-overlay";
  body.appendChild(overlayDiv);
}

export function sidebarItem(label: string, txt: string) {
  const host = document.createElement("div");
  host.className = "spotlight-setting-item";
  const settingDetails = document.createElement("div");
  settingDetails.className = "spotlight-setting-details";
  const settingsLabel = document.createElement("label");
  settingsLabel.textContent = label;
  settingDetails.appendChild(settingsLabel);
  const settingspan = document.createElement("span");
  settingspan.textContent = txt;
  settingDetails.appendChild(settingspan);
  host.appendChild(settingDetails);
  return host;
}

export function SidebarSettings() {
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

  function closeSettings() {
    settingsModal.classList.remove("spotlight-modal-visible");
    overlay.classList.remove("spotlight-modal-visible");
  }

  settingsButton?.addEventListener("click", () => {
    settingsModal.classList.add("spotlight-modal-visible");
    overlay.classList.add("spotlight-modal-visible");
  });

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

  engineTrigger?.addEventListener("click", () => {
    engineOptionsList.classList.toggle("spotlight-open");
  });

  // Event Delegation for better performance
  engineOptionsList?.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const option = target.closest(
      ".spotlight-engine-option-item",
    ) as HTMLElement;

    if (!option) return;

    const selectedImgSrc = option.querySelector("img")?.src;
    const selectedName = option.querySelector("span")?.textContent;

    if (selectedName && selectedImgSrc) {
      // Update the trigger button's content
      const triggerImg = engineTrigger.querySelector("img");
      const triggerSpan = engineTrigger.querySelector("span");
      if (triggerImg && triggerSpan) {
        triggerImg.src = selectedImgSrc;
        triggerImg.alt = selectedName;
        triggerSpan.textContent = selectedName;
      }
      localStorage.setItem("searchEngine", selectedName);
      config.searchEngine = selectedName;
      storage.sync.set({ searchEngine: selectedName });
    }
    // Close the dropdown
    engineOptionsList.classList.remove("spotlight-open");
  });
}

export function hidePage() {
  const mainContent = document.getElementById(
    "spotlight-page-container",
  ) as HTMLElement;

  if (mainContent) {
    mainContent.style.display = "none";
  }
}
