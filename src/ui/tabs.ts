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

    // Fallback for missing/broken icons
    const iconUrl = `https://favicon.is/${newUrl.hostname}?large=true`;
    tabItem.innerHTML = `<img src="${iconUrl}" alt="${tab.title}" class="tab-icon">`;

    // Sync active styling on mouse hover
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
      // Scroll smoothly into view if tabs overflow the viewport width
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

  // If moving backwards on open, go to the last item; otherwise, go to the second item (index 1)
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
