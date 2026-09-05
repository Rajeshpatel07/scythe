import { config } from "../../../core/config/config";
import { showSpotlight } from "../../spotlight/services/spotlight.controller";

let pageContainer: HTMLDivElement;

export function createNewTabPage() {
  const body = document.body as HTMLBodyElement;
  body.id = "spotlight-body";

  pageContainer = newtabPageContent();
  body.appendChild(pageContainer);

  applyPageVisibility();

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "sync" && changes.showNewTab !== undefined) {
      config.hideNewTab = changes.showNewTab.newValue as boolean;
      applyPageVisibility();
    }
  });
}

function applyPageVisibility(): void {
  const body = document.body as HTMLBodyElement;
  if (config.hideNewTab) {
    pageContainer.style.display = "none";
    body.classList.add("minimal-empty");
  } else {
    pageContainer.style.display = "";
    body.classList.remove("minimal-empty");
  }
}

function newtabPageContent() {
  const rootEl = document.createElement("div");
  rootEl.id = "spotlight-page-container";

  const mainContent = document.createElement("main");
  mainContent.id = "spotlight-main-content";

  mainContent.appendChild(buildBrand());
  mainContent.appendChild(buildSearchForm());
  rootEl.appendChild(mainContent);

  return rootEl;
}

function buildBrand(): HTMLElement {
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

  return brandContainer;
}

function buildSearchForm(): HTMLElement {
  const searchForm = document.createElement("form");
  searchForm.id = "spotlight-search-form";
  searchForm.action = "https://duckduckgo.com/";
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
  searchInput.placeholder = "Search the web...";
  searchInput.autocomplete = "off";

  searchInput.onfocus = () => {
    if (!config.isSpotlightOpen) showSpotlight();
  };
  searchWrapper.appendChild(searchInput);

  searchForm.appendChild(searchWrapper);

  return searchForm;
}
