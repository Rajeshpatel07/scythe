import { config } from "../../../core/config/config";
import { showSidebar } from "./sidebar.component";
import { showSpotlight } from "../../../main";

export function createNewTabPage() {
  const body = document.body as HTMLBodyElement;
  body.id = "spotlight-body";

  const pageContainer = newtabPageContent();
  showSidebar(body);
  body.appendChild(pageContainer);

  if (config.hideNewTab) {
    pageContainer.style.display = "none";
    body.classList.add("minimal-empty");
  } else {
    body.classList.remove("minimal-empty");
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
  mainContent.appendChild(searchForm);
  pageContainer.appendChild(mainContent);

  return pageContainer;
}
