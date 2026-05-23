import { getHighResFallback, loadFaviconFromCache } from "../browser/cache";
import { config } from "../config/config";
import type { TabsResponse } from "../types/historyTypes";
import { getShadowHost, getShadowRoot } from "../utils/dom";

export function createTabsDock() {
  const host = document.createElement("div");
  host.id = "spotlight-host";
  host.setAttribute("style", "position:fixed;bottom:0;right:0;z-index:9999;");
  document.body.appendChild(host);
  const shadowRoot = host.attachShadow({ mode: "open" });
  const stylesheetLink = document.createElement("link");
  stylesheetLink.setAttribute("rel", "stylesheet");
  stylesheetLink.setAttribute("href", chrome.runtime.getURL("src/tabs.css"));
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
  const shadowRoot = getShadowRoot();
  if (!shadowRoot) return;

  const container = shadowRoot.getElementById("tab-list") as HTMLDivElement;

  let response: TabsResponse | null;
  try {
    response = (await chrome.runtime.sendMessage({
      action: "getTabs",
    })) as TabsResponse;
  } catch {
    response = null;
  }

  if (!response || !response.tabs) {
    return;
  }

  container.innerHTML = "";

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

    const tabUrl = newUrl.hostname.split(".");
    let title = tabUrl[0];
    if (tabUrl[0] === "www") {
      title = tabUrl[1];
    }

    title = title.charAt(0).toUpperCase() + title.slice(1);

    tabItem.setAttribute("data-title", title);

    const img = document.createElement("img");
    img.classList.add("tab-icon");
    img.alt = tab.title || "";

    const hostname = newUrl.hostname;

    const currentTargetUrl = tab.url;
    img.setAttribute("data-loading-url", currentTargetUrl);

    (async () => {
      try {
        const storageKey = `fav_${hostname}`;
        const result = await chrome.storage.local.get([storageKey]);
        const cachedDataUrl = result[storageKey];

        if (cachedDataUrl && cachedDataUrl !== "null") {
          img.src = cachedDataUrl;
          return;
        }

        loadFaviconFromCache(tab.url, img, 128);
        if (newUrl.protocol === "chrome:") return;

        const highResResult = await getHighResFallback(hostname);

        if (highResResult.status === "success" && highResResult.dataUrl) {
          if (img.getAttribute("data-loading-url") === currentTargetUrl) {
            img.style.opacity = "0.4";
            setTimeout(() => {
              if (highResResult.dataUrl) {
                img.src = highResResult.dataUrl;
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

    container.appendChild(tabItem);
  });

  config.tabSelectedIndex = activeTabIndex;
}

export function updateSelection(index: number) {
  const shadowRoot = getShadowRoot();
  if (!shadowRoot) return;

  const tabTitle = shadowRoot.getElementById(
    "active-tab-title",
  ) as HTMLDivElement;

  config.tabSelectedIndex = index;
  const items = shadowRoot.querySelectorAll(".tab-item");
  items.forEach((item, idx) => {
    if (idx === index) {
      item.classList.add("selected");
      //@ts-ignore
      tabTitle.textContent = item.attributes["data-title"].value;
      item.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    } else {
      item.classList.remove("selected");
    }
  });
}

export function confirmSelection() {
  const shadowRoot = getShadowRoot();
  if (!shadowRoot) return;

  const items = shadowRoot.querySelectorAll(".tab-item");
  const chosenTab = items[config.tabSelectedIndex];

  closeSwitcher();

  chrome.runtime.sendMessage({
    action: "switchTab",
    id: chosenTab.id,
  });
}

export async function openSwitcher(isReverse = false) {
  createTabsDock();
  await renderTabs();

  const shadowRoot = getShadowRoot();
  if (!shadowRoot) return;

  const overlay = shadowRoot.getElementById(
    "switcher-overlay",
  ) as HTMLDivElement;
  const items = shadowRoot.querySelectorAll(".tab-item");
  const tabsLen = items.length;

  config.tabIsOpen = true;
  overlay.classList.remove("hidden");

  if (isReverse) {
    updateSelection((config.tabSelectedIndex - 1 + tabsLen) % tabsLen);
  } else {
    updateSelection((config.tabSelectedIndex + 1) % tabsLen);
  }
}

export function closeSwitcher() {
  const shadowRoot = getShadowRoot();
  const shadowHost = getShadowHost();

  if (!shadowRoot || !shadowHost) return;

  const overlay = shadowRoot.getElementById(
    "switcher-overlay",
  ) as HTMLDivElement;

  setTimeout(() => {
    config.tabIsOpen = false;
    config.modifierPressed = false;
    overlay.classList.add("hidden");
    shadowHost.remove();
  }, 200);
}
