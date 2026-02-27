import { config } from "../config/config.ts";
import { showSpotlight } from "../main";
import { showSidebar } from "./sidebar";

export function createNewTabPage() {
  const body = document.body as HTMLBodyElement;
  body.id = "spotlight-body";

  if (!config.shownewtab) {
    const pageContainer = newtabPageContent();
    showSidebar(body);
    body.appendChild(pageContainer);
  } else {
    showSidebar(body);
  }
}

function newtabPageContent() {
  const pageContainer = document.createElement("div");
  pageContainer.id = "spotlight-page-container";

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
  titleH1.textContent = "Scythe";
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
  searchInput.placeholder = "Search anything, find anything...";
  searchInput.autocomplete = "off";

  searchInput.onfocus = () => {
    if (!config.isModelOpen) showSpotlight();
  };
  searchWrapper.appendChild(searchInput);

  searchForm.appendChild(searchWrapper);
  mainContent.appendChild(searchForm);
  pageContainer.appendChild(mainContent);

  const infoContainer = document.createElement("div");
  infoContainer.className = "spotlight-info-widget-container";

  const infoButton = document.createElement("button");
  infoButton.className = "spotlight-info-button";
  infoButton.id = "spotlight-info-toggle-button";
  infoButton.setAttribute("aria-label", "Show shortcuts");

  infoButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
      stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  `;

  // Popup box
  const popup = document.createElement("div");
  popup.className = "spotlight-info-popup";
  popup.id = "spotlight-info-popup-box";

  infoButton.onclick = () => {
    if (popup.classList.contains("spotlight-visible")) {
      popup.classList.remove("spotlight-visible");
    } else {
      popup.classList.add("spotlight-visible");
    }
  };

  const ul = document.createElement("ul");

  const shortcuts = [
    { keys: ["Ctrl", "Shift", "K"], action: "Websites" },
    { keys: ["Ctrl", "/"], action: "New Tab" }
  ];

  for (const shortcut of shortcuts) {
    const li = document.createElement("li");

    const keysSpan = document.createElement("span");
    keysSpan.innerHTML = shortcut.keys
      .map(key => `<kbd>${key}</kbd>`)
      .join(" + ");

    const arrowSpan = document.createElement("span");
    arrowSpan.innerHTML = "&rarr;";

    const actionSpan = document.createElement("span");
    actionSpan.textContent = shortcut.action;

    li.appendChild(keysSpan);
    li.appendChild(arrowSpan);
    li.appendChild(actionSpan);
    ul.appendChild(li);
  }

  popup.appendChild(ul);

  infoContainer.appendChild(infoButton);
  infoContainer.appendChild(popup);

  pageContainer.appendChild(infoContainer);

  const footer = document.createElement("footer");
  footer.id = "spotlight-footer";

  const navList = document.createElement("ul");
  navList.id = "spotlight-nav-list";

  const githubNavItem = document.createElement("li");
  githubNavItem.className = "spotlight-nav-item";
  const githubLink = document.createElement("a");
  githubLink.href = "https://github.com/Rajeshpatel07/scythe";
  githubLink.className = "spotlight-nav-link";
  githubLink.textContent = "Github";
  githubNavItem.appendChild(githubLink);
  navList.appendChild(githubNavItem);

  const aboutNavItem = document.createElement("li");
  aboutNavItem.className = "spotlight-nav-item";
  const aboutLink = document.createElement("a");
  aboutLink.href = "https://x.com/rajeshp04252589";
  aboutLink.className = "spotlight-nav-link";
  aboutLink.textContent = "rajesh";
  aboutNavItem.appendChild(aboutLink);
  navList.appendChild(aboutNavItem);

  footer.appendChild(navList);
  pageContainer.appendChild(footer);
  return pageContainer;
}
