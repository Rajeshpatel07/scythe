import { loadFaviconFromCache } from "../../../core/services/favicon.service";
import { config } from "../../../core/config/config";
import type { ListItems } from "../../../core/types/domain.types";
import { LIKELY_URL_REGEX } from "../../../core/config/constants";
import { getHostRoot } from "../../../core/utils/host.utils";
import { hideSpotlight } from "../components/spotlight.component";
import { openUrl } from "../../../core/services/navigation.service";
import {
  NO_SELECTION,
  RESULT_URL_ATTRIBUTE,
  SPOTLIGHT_CLASSES,
} from "../spotlight.constants";

function attachFavicon(favicon: HTMLImageElement, url: string): void {
  if (LIKELY_URL_REGEX.test(url)) {
    loadFaviconFromCache(url, favicon);
  } else {
    favicon.src = chrome.runtime.getURL("src/assets/icon48.png");
  }
}

export function createListItem({ title, url, showUrl = true }: ListItems) {
  const li = document.createElement("li");
  li.className = SPOTLIGHT_CLASSES.resultItem;
  li.setAttribute(RESULT_URL_ATTRIBUTE, url);
  li.addEventListener("click", () => {
    hideSpotlight();
    openUrl(url, config.openInNewTab);
  });

  const favicon = document.createElement("img");
  favicon.className = "spotlight-favicon-ext";
  attachFavicon(favicon, url);
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

  const results = root.querySelectorAll(`.${SPOTLIGHT_CLASSES.resultItem}`);
  if (results.length === 0) return;

  if (config.selectedResultIndex !== NO_SELECTION) {
    results[config.selectedResultIndex]?.classList.remove(
      SPOTLIGHT_CLASSES.selected,
    );
  }

  if (direction === "ArrowDown") {
    config.selectedResultIndex =
      (config.selectedResultIndex + 1) % results.length;
  } else if (direction === "ArrowUp") {
    config.selectedResultIndex =
      config.selectedResultIndex === NO_SELECTION
        ? results.length - 1
        : (config.selectedResultIndex - 1 + results.length) % results.length;
  }

  results[config.selectedResultIndex]?.classList.add(
    SPOTLIGHT_CLASSES.selected,
  );
  results[config.selectedResultIndex]?.scrollIntoView({ block: "nearest" });
}

export function renderListItems(
  items: ListItems[],
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
