import {
  loadFaviconFromCache,
  getHighResFallback,
} from "../../../core/services/favicon.service";
import { config } from "../../../core/config/config";
import type {
  faviconURLInterface,
  TabsResponse,
} from "../../../core/types/domain.types";
import { getShadowHost, getSwitcherRoot } from "../../../core/utils/dom.utils";
import { MessageBroker } from "../../../core/messaging/message.broker";
import {
  updateSelection,
  confirmSelection,
} from "../handlers/selection.handler";

export function createTabsDock() {
  const host = document.createElement("div");
  host.id = "ext-switcher-host";
  host.setAttribute(
    "style",
    "position:fixed;bottom:0;right:0;z-index:2147483647;",
  );
  document.body.appendChild(host);
  const shadowRoot = host.attachShadow({ mode: "open" });
  const stylesheetLink = document.createElement("link");
  stylesheetLink.setAttribute("rel", "stylesheet");
  stylesheetLink.setAttribute(
    "href",
    chrome.runtime.getURL("src/core/styles/tabs.css"),
  );
  shadowRoot.appendChild(stylesheetLink);

  const overlay = document.createElement("div");
  overlay.setAttribute("id", "switcher-overlay");
  overlay.setAttribute("class", "overlay hidden");

  const container = document.createElement("div");
  container.setAttribute("class", "switcher-container");

  const tabList = document.createElement("div");
  tabList.setAttribute("id", "tab-list");
  tabList.setAttribute("class", "tab-list");

  const tabTitle = document.createElement("div");
  tabTitle.setAttribute("id", "active-tab-title");
  tabTitle.setAttribute("class", "active-title");

  container.appendChild(tabList);
  container.appendChild(tabTitle);

  overlay.appendChild(container);

  shadowRoot.appendChild(overlay);
}

export async function renderTabs() {
  const root = getSwitcherRoot();
  if (!root) return;

  const container = root.getElementById("tab-list") as HTMLDivElement;

  let response: TabsResponse | null;
  try {
    response = await MessageBroker.send({ action: "getTabs" });
  } catch {
    response = null;
  }

  if (!response || !response.tabs) {
    return;
  }

  container.innerHTML = "";
  const fragment = document.createDocumentFragment();

  let activeTabIndex = 0;
  response.tabs.forEach((tab, index) => {
    if (tab.active) {
      activeTabIndex = index;
    }

    const newUrl = new URL(tab.url);
    const tabItem = document.createElement("div");
    tabItem.classList.add("tab-item");
    tabItem.setAttribute("id", tab.id);
    //@ts-ignore
    tabItem.setAttribute("data-index", index);

    tabItem.setAttribute("data-title", tab.title);

    const img = document.createElement("img");
    img.classList.add("tab-icon");
    img.alt = tab.title || "";

    const hostname = newUrl.hostname;

    const currentTargetUrl = tab.url;
    img.setAttribute("data-loading-url", currentTargetUrl);

    (async () => {
      try {
        if (!document.getElementById("ext-switcher-host")) return;

        const storageKey = `fav_${hostname}`;
        const result = await chrome.storage.local.get<faviconURLInterface>([
          storageKey,
        ]);
        const cachedDataUrl = result[storageKey];

        if (cachedDataUrl && cachedDataUrl !== "null") {
          img.src = cachedDataUrl;
          return;
        }

        loadFaviconFromCache(tab.url, img, 128);
        if (newUrl.protocol === "chrome:") return;

        const highResResult = await getHighResFallback(hostname);

        if (!document.getElementById("ext-switcher-host")) return;

        if (highResResult.status === "success" && highResResult.dataUrl) {
          if (img.getAttribute("data-loading-url") === currentTargetUrl) {
            img.style.opacity = "0.4";
            const src = highResResult.dataUrl;
            setTimeout(() => {
              if (
                src &&
                document.getElementById("ext-switcher-host")
              ) {
                img.src = src;
                img.style.opacity = "1";
              }
            }, 60);

            await chrome.storage.local.set({
              [storageKey]: highResResult.dataUrl,
            });
          }
        }
      } catch (_error) {}
    })();

    tabItem.appendChild(img);

    tabItem.addEventListener("mouseenter", () => updateSelection(index));
    tabItem.addEventListener("click", () => {
      confirmSelection();
    });

    fragment.appendChild(tabItem);
  });

  container.appendChild(fragment);
  config.tabSelectedIndex = activeTabIndex;
}

export async function openSwitcher(isReverse = false) {
  createTabsDock();
  await renderTabs();

  const root = getSwitcherRoot();
  if (!root) return;

  const overlay = root.getElementById("switcher-overlay") as HTMLDivElement;
  const items = root.querySelectorAll(".tab-item");
  const tabsLen = items.length;

  config.isTabOpen = true;
  overlay.classList.remove("hidden");

  if (isReverse) {
    updateSelection((config.tabSelectedIndex - 1 + tabsLen) % tabsLen);
  } else {
    updateSelection((config.tabSelectedIndex + 1) % tabsLen);
  }
}

export function closeSwitcher() {
  const root = getSwitcherRoot();
  const host = getShadowHost("ext-switcher-host");

  if (!root || !host) return;

  const overlay = root.getElementById("switcher-overlay") as HTMLDivElement;

  setTimeout(() => {
    config.isTabOpen = false;
    overlay.classList.add("hidden");
    host.remove();
  }, 200);
}
