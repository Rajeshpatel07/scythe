import { showSpotlight } from "../main";

export function createNewTabPage() {
  const body = document.body;
  body.id = "spotlight-body";

  const pageContainer = document.createElement("div");
  pageContainer.id = "spotlight-page-container";

  const header = document.createElement("header");
  header.id = "spotlight-header";

  const settingsButton = document.createElement("button");
  settingsButton.id = "spotlight-settings-button";
  settingsButton.className = "spotlight-icon-button";
  settingsButton.setAttribute("aria-label", "Open settings");
  settingsButton.innerHTML = `
        <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="24" height="24" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round">
            <path
                d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    `;
  header.appendChild(settingsButton);
  pageContainer.appendChild(header);

  const mainContent = document.createElement("main");
  mainContent.id = "spotlight-main-content";

  const brandContainer = document.createElement("div");
  brandContainer.id = "spotlight-brand-container";

  const logoImg = document.createElement("img");
  logoImg.src = "src/assets/icon128.png";
  logoImg.alt = "logo";
  logoImg.id = "spotlight-logo";
  brandContainer.appendChild(logoImg);

  const titleH1 = document.createElement("h1");
  titleH1.id = "spotlight-title";
  titleH1.textContent = "Spotlight";
  brandContainer.appendChild(titleH1);
  mainContent.appendChild(brandContainer);

  const searchForm = document.createElement("form");
  searchForm.id = "spotlight-search-form";
  searchForm.action = "[https://duckduckgo.com/](https://duckduckgo.com/)";
  searchForm.method = "get";

  const searchWrapper = document.createElement("div");
  searchWrapper.className = "spotlight-search-wrapper";

  searchWrapper.innerHTML = `
        <svg class="spotlight-search-icon-left" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
	  <circle cx="11" cy="11" r="8"></circle>
	  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
	</svg>
    `;

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.id = "spotlight-search-input";
  searchInput.name = "q";
  searchInput.placeholder = "Ask anything, find anything...";
  searchInput.autocomplete = "off";
  searchInput.autofocus = true;

  searchInput.onfocus = showSpotlight;
  searchWrapper.appendChild(searchInput);

  searchForm.appendChild(searchWrapper);
  mainContent.appendChild(searchForm);
  pageContainer.appendChild(mainContent);

  const footer = document.createElement("footer");
  footer.id = "spotlight-footer";

  const navList = document.createElement("ul");
  navList.id = "spotlight-nav-list";

  const githubNavItem = document.createElement("li");
  githubNavItem.className = "spotlight-nav-item";
  const githubLink = document.createElement("a");
  githubLink.href = "#";
  githubLink.className = "spotlight-nav-link";
  githubLink.textContent = "GitHub";
  githubNavItem.appendChild(githubLink);
  navList.appendChild(githubNavItem);

  const aboutNavItem = document.createElement("li");
  aboutNavItem.className = "spotlight-nav-item";
  const aboutLink = document.createElement("a");
  aboutLink.href = "#";
  aboutLink.className = "spotlight-nav-link";
  aboutLink.textContent = "About";
  aboutNavItem.appendChild(aboutLink);
  navList.appendChild(aboutNavItem);

  footer.appendChild(navList);
  pageContainer.appendChild(footer);

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
        <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="24" height="24"
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
  const searchEngineSettingItem = document.createElement("div");
  searchEngineSettingItem.className = "spotlight-setting-item";

  const searchEngineSettingIcon = document.createElement("div");
  searchEngineSettingIcon.className = "spotlight-setting-icon";
  searchEngineSettingIcon.innerHTML = `
        <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="20" height="20"
            viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
    `;
  searchEngineSettingItem.appendChild(searchEngineSettingIcon);

  const searchEngineSettingDetails = document.createElement("div");
  searchEngineSettingDetails.className = "spotlight-setting-details";
  const searchEngineLabel = document.createElement("label");
  searchEngineLabel.textContent = "Search engine";
  searchEngineSettingDetails.appendChild(searchEngineLabel);
  const searchEngineSpan = document.createElement("span");
  searchEngineSpan.textContent = "Choose your default engine";
  searchEngineSettingDetails.appendChild(searchEngineSpan);
  searchEngineSettingItem.appendChild(searchEngineSettingDetails);

  const searchEngineSettingControl = document.createElement("div");
  searchEngineSettingControl.className = "spotlight-setting-control";

  const engineSelectWrapper = document.createElement("div");
  engineSelectWrapper.className = "spotlight-engine-select-wrapper";

  const engineSelectTrigger = document.createElement("button");
  engineSelectTrigger.className = "spotlight-engine-select-trigger";
  engineSelectTrigger.id = "spotlight-engine-trigger";

  const defaultEngineImg = document.createElement("img");
  defaultEngineImg.src = "https://svgl.app/library/google.svg";
  defaultEngineImg.alt = "Google";
  engineSelectTrigger.appendChild(defaultEngineImg);

  const defaultEngineSpan = document.createElement("span");
  defaultEngineSpan.textContent = "Google";
  engineSelectTrigger.appendChild(defaultEngineSpan);

  const dropdownArrow = document.createElement("svg");
  dropdownArrow.setAttribute(
    "xmlns",
    "[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)",
  );
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

  const engines = [
    {
      name: "Google",
      value: "google",
      favicon: "https://svgl.app/library/google.svg",
    },
    {
      name: "DuckDuckGo",
      value: "duckduckgo",
      favicon: "https://svgl.app/library/duckduckgo.svg",
    },
    {
      name: "Brave",
      value: "brave",
      favicon: "https://svgl.app/library/brave.svg",
    },
    {
      name: "Bing",
      value: "bing",
      favicon: "https://svgl.app/library/bing.svg",
    },
    {
      name: "Unduck",
      value: "unduck",
      favicon:
        "[https://i.ibb.co/6g3wzCf/spotlight-logo-removebg-preview.png](https://i.ibb.co/6g3wzCf/spotlight-logo-removebg-preview.png)",
      style: "background: #fff; border-radius: 50%;",
    },
  ];

  engines.forEach((engine) => {
    const optionItem = document.createElement("li");
    optionItem.className = "spotlight-engine-option-item";
    optionItem.setAttribute("data-value", engine.value);

    const img = document.createElement("img");
    img.src = engine.favicon;
    img.alt = engine.name;
    if (engine.style) {
      img.style.cssText = engine.style;
    }
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
  settingsModal.appendChild(settingsContent);
  pageContainer.appendChild(settingsModal);

  const overlayDiv = document.createElement("div");
  overlayDiv.id = "spotlight-overlay";
  pageContainer.appendChild(overlayDiv);

  body.appendChild(pageContainer);
}
