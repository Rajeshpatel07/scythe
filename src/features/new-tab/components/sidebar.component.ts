import { config } from "../../../core/config/config";
import { storage } from "../../../core/storage/storage.utils";


export function showSidebar(body: HTMLBodyElement): void {
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
  const currentEngineVal = config.searchEngine?.toLowerCase() || "google";
  const engine = engines.find((e) => currentEngineVal === e.value);

  defaultEngineImg.src = engine
    ? engine.favicon
    : "src/assets/search-engine-logos/google.svg";
  defaultEngineImg.alt = engine ? engine.name : "Google";
  engineSelectTrigger.appendChild(defaultEngineImg);

  const defaultEngineSpan = document.createElement("span");
  defaultEngineSpan.textContent = engine ? engine.name : "Google";
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

  engineSelectWrapper.appendChild(engineOptionsList);
  searchEngineSettingControl.appendChild(engineSelectWrapper);
  searchEngineSettingItem.appendChild(searchEngineSettingControl);
  settingsContent.appendChild(searchEngineSettingItem);

  const togglePageSettings = sidebarItem(
    "Page Content",
    "Show or hide content on the new tab page",
  );

  const toggleNewTabPage = createToggle(config.hideNewTab, (isChecked) => {
    if (isChecked) {
      storage.sync.set({ showNewTab: true });
      config.hideNewTab = true;
      hidePage();
      document.body.classList.add("minimal-empty");
    } else {
      storage.sync.set({ showNewTab: false });
      config.hideNewTab = false;
      const pageContainer = document.getElementById("spotlight-page-container");
      if (pageContainer) {
        pageContainer.style.display = "";
      }
      document.body.classList.remove("minimal-empty");
    }
  });



  togglePageSettings.appendChild(toggleNewTabPage);
  settingsContent.appendChild(togglePageSettings);

  addFeatureToggle(
    settingsContent,
    "Spotlight",
    "Quick search web",
    "isSpotlightEnabled",
  );
  addFeatureToggle(
    settingsContent,
    "Tab Switcher",
    "Quickly switch between open tabs",
    "isTabEnabled",
  );
  addFeatureToggle(
    settingsContent,
    "Glance",
    "Preview links without leaving the page",
    "isGlanceEnabled",
  );

  settingsModal.appendChild(settingsContent);

  body.appendChild(settingsModal);

  const overlayDiv = document.createElement("div");
  overlayDiv.id = "spotlight-overlay";
  body.appendChild(overlayDiv);
}

function addFeatureToggle(
  container: HTMLElement,
  label: string,
  description: string,
  configKey: "isSpotlightEnabled" | "isTabEnabled" | "isGlanceEnabled",
): void {
  const settingsItem = sidebarItem(label, description);
  const toggle = createToggle(config[configKey], (isChecked) => {
    storage.sync.set({ [configKey]: isChecked });
    config[configKey] = isChecked;
  });
  settingsItem.appendChild(toggle);
  container.appendChild(settingsItem);
}

export function createToggle(
  isEnabled: boolean,
  handler: (isChecked: boolean) => void,
): HTMLDivElement {
  const toggleControl = document.createElement("div");
  toggleControl.className = "spotlight-toggle-container";

  const switchLabel = document.createElement("label");
  switchLabel.className = "spotlight-switch";

  const toggleCheckbox = document.createElement("input");
  toggleCheckbox.type = "checkbox";
  toggleCheckbox.className = "spotlight-switch-input";
  toggleCheckbox.checked = isEnabled;

  const slider = document.createElement("span");
  slider.className = "spotlight-switch-slider";

  const circle = document.createElement("span");
  circle.className = "spotlight-switch-thumb";

  slider.appendChild(circle);
  switchLabel.appendChild(toggleCheckbox);
  switchLabel.appendChild(slider);
  toggleControl.appendChild(switchLabel);

  toggleCheckbox.onchange = (e: Event) => {
    const isChecked = (e.target as HTMLInputElement).checked;
    handler(isChecked);
  };

  return toggleControl;
}

export function sidebarItem(label: string, txt: string): HTMLDivElement {
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

let sidebarKeydownAdded = false;

export function sidebarSettings(): void {
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

  if (!sidebarKeydownAdded) {
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      const modal = document.getElementById("spotlight-settings-modal");
      if (!modal?.classList.contains("spotlight-modal-visible")) return;
      modal.classList.remove("spotlight-modal-visible");
      const overlayEl = document.getElementById("spotlight-overlay");
      overlayEl?.classList.remove("spotlight-modal-visible");
    });
    sidebarKeydownAdded = true;
  }

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
  engineOptionsList?.addEventListener("click", (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const option = target.closest(
      ".spotlight-engine-option-item",
    ) as HTMLElement;

    if (!option) return;

    const selectedVal = option.getAttribute("data-value");
    const selectedImgSrc = option.querySelector("img")?.src;
    const selectedName = option.querySelector("span")?.textContent;

    if (selectedVal && selectedName && selectedImgSrc) {
      // Update the trigger button's content
      const triggerImg = engineTrigger.querySelector("img");
      const triggerSpan = engineTrigger.querySelector("span");
      if (triggerImg && triggerSpan) {
        triggerImg.src = selectedImgSrc;
        triggerImg.alt = selectedName;
        triggerSpan.textContent = selectedName;
      }
      config.searchEngine = selectedVal;
      storage.sync.set({ searchEngine: selectedVal });
    }
    // Close the dropdown
    engineOptionsList.classList.remove("spotlight-open");
  });
}

export function hidePage(): void {
  const mainContent = document.getElementById(
    "spotlight-page-container",
  ) as HTMLElement;

  if (mainContent) {
    mainContent.style.display = "none";
  }
}
