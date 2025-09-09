import { loadFaviconFromCache } from "../browser/cache";
import { InitiatePageNavigation } from "../browser/search";
import { config } from "../config";
import { getShadowRoot } from "../utils/dom";

export function createListItem(
  title: string,
  url: string,
  showUrl: boolean = true,
) {
  const li = document.createElement("li");
  li.className = "spotlight-result-item-ext";
  li.setAttribute("data-url", url);
  li.addEventListener("click", () => {
    InitiatePageNavigation(url);
  });

  const favicon = document.createElement("img");
  favicon.className = "spotlight-favicon-ext";

  const isLikelyURL =
    /^(https?:\/\/)?([\w.-]+\.[a-z]{2,})(\/[^\s]*)?$/i.test(url) ||
    /^(?!:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/i.test(url);

  if (isLikelyURL) {
    loadFaviconFromCache(url, favicon);
  } else {
    favicon.src = chrome.runtime.getURL("src/assets/icon48.png");
  }
  const textContent = document.createElement("div");
  textContent.className = "spotlight-text-content-ext";
  const titleEl = document.createElement("span");
  titleEl.className = "spotlight-title-ext";
  titleEl.textContent = title;
  if (showUrl) {
    const urlEl = document.createElement("span");
    urlEl.className = "spotlight-url-ext";
    if (url.length > 0) {
      urlEl.textContent = `— ${url}`;
    }
    textContent.appendChild(titleEl);
    textContent.appendChild(urlEl);
  } else {
    textContent.appendChild(titleEl);
  }

  li.appendChild(favicon);
  li.appendChild(textContent);
  return li;
}

export function navigateResults(direction: "ArrowDown" | "ArrowUp") {
  const shadowRoot = getShadowRoot();
  if (!shadowRoot) return;

  const results = shadowRoot.querySelectorAll(".spotlight-result-item-ext");
  if (results.length === 0) return;

  if (config.selectedResultIndex !== -1) {
    results[config.selectedResultIndex].classList.remove("selected");
  }

  if (direction === "ArrowDown") {
    config.selectedResultIndex =
      (config.selectedResultIndex + 1) % results.length;
  } else if (direction === "ArrowUp") {
    config.selectedResultIndex =
      (config.selectedResultIndex - 1 + results.length) % results.length;
  }

  results[config.selectedResultIndex].classList.add("selected");
  results[config.selectedResultIndex].scrollIntoView({ block: "nearest" });
}
