import { loadFaviconFromCache } from "../../../core/services/favicon.service";
import { config } from "../../../core/config/config";
import type { ListItems } from "../../../core/types/domain.types";
import { getHostRoot } from "../../../core/utils/host.utils";
import { hideSpotlight } from "../components/spotlight.component";
import { openUrl } from "../../../core/services/navigation.service";

export function createListItem({ title, url, showUrl = true }: ListItems) {
  const li = document.createElement("li");
  li.className = "spotlight-result-item-ext";
  li.setAttribute("data-url", url);
  li.addEventListener("click", () => {
    hideSpotlight();
    openUrl(url, config.openNewtab);
  });

  const favicon = document.createElement("img");
  favicon.className = "spotlight-favicon-ext";

  const isLikelyURL = /^(https?:\/\/)?([\w.-]+\.[a-z]{2,})(\/[^\s]*)?$/i.test(
    url,
  );

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
  const root = getHostRoot();
  if (!root) return;

  const results = root.querySelectorAll(".spotlight-result-item-ext");
  if (results.length === 0) return;

  if (config.selectedResultIndex !== -1) {
    results[config.selectedResultIndex]?.classList.remove("selected");
  }

  if (direction === "ArrowDown") {
    config.selectedResultIndex =
      (config.selectedResultIndex + 1) % results.length;
  } else if (direction === "ArrowUp") {
    config.selectedResultIndex =
      (config.selectedResultIndex - 1 + results.length) % results.length;
  }

  results[config.selectedResultIndex]?.classList.add("selected");
  results[config.selectedResultIndex]?.scrollIntoView({ block: "nearest" });
}

export function renderListItems(
  items: { title: string; url: string; showUrl?: boolean }[],
  resultList: HTMLUListElement,
) {
  const fragment = document.createDocumentFragment();

  items.forEach((item) => {
    const li = createListItem({
      title: item.title || item.url,
      url: item.url,
      showUrl: item.showUrl,
    });
    fragment.appendChild(li);
  });

  resultList.innerHTML = "";
  resultList.appendChild(fragment);
}
