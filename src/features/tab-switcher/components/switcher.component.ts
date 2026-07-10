import {
  loadFaviconFromCache,
  getHighResFallback,
} from "../../../core/services/favicon.service";
import { config } from "../../../core/config/config";
import type { TabsResponse } from "../../../core/types/domain.types";
import { getHostRoot } from "../../../core/utils/host.utils";
import { ensureHost, removeHost } from "../../../core/utils/host.utils";
import { storage } from "../../../core/storage/storage.utils";
import { MessageBroker } from "../../../core/messaging/message.broker";
import {
  updateSelection,
  confirmSelection,
  setCachedTabItems,
  clearCachedTabItems,
} from "../handlers/selection.handler";

export function createTabsDock(): void {
  const shadowRoot = ensureHost("switcher");

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

export async function renderTabs(): Promise<void> {
  const root = getHostRoot();
  if (!root) return;

  const container = root.getElementById("tab-list") as HTMLDivElement;

  let response: TabsResponse | null;
  try {
    response = await MessageBroker.send({ action: "getTabs" });
  } catch {
    response = null;
  }

  if (!response?.tabs) {
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
    tabItem.setAttribute("data-index", String(index));

    tabItem.setAttribute("data-title", tab.title);

    const img = document.createElement("img");
    img.classList.add("tab-icon");
    img.alt = tab.title || "";

    const hostname = newUrl.hostname;

    const currentTargetUrl = tab.url;
    img.setAttribute("data-loading-url", currentTargetUrl);

    (async () => {
      const host = document.getElementById("scythe-host");
      if (!host) return;

      try {
        const storageKey = `fav_${hostname}`;
        const result = await storage.local.get<string>([storageKey]);
        const cachedDataUrl = result[storageKey];

        if (cachedDataUrl && cachedDataUrl !== "null") {
          img.src = cachedDataUrl;
          return;
        }

        loadFaviconFromCache(tab.url, img, 128);
        if (newUrl.protocol === "chrome:") return;

        const highResResult = await getHighResFallback(hostname);

        if (!document.getElementById("scythe-host")) return;

        if (highResResult.status === "success" && highResResult.dataUrl) {
          if (img.getAttribute("data-loading-url") === currentTargetUrl) {
            img.style.opacity = "0.4";
            const src = highResResult.dataUrl;
            setTimeout(() => {
              if (src && document.getElementById("scythe-host")) {
                img.src = src;
                img.style.opacity = "1";
              }
            }, 60);

            await storage.local.set({
              [storageKey]: highResResult.dataUrl,
            });
          }
        }
      } catch (err) {
        // biome-ignore lint/suspicious/noConsole: diagnostic logging
        console.error("Favicon load error:", err);
      }
    })();

    tabItem.appendChild(img);

    tabItem.addEventListener("mouseenter", () => updateSelection(index));
    tabItem.addEventListener("click", () => {
      confirmSelection();
    });

    fragment.appendChild(tabItem);
  });

  container.appendChild(fragment);

  const rootForCache = getHostRoot();
  if (rootForCache) {
    setCachedTabItems(rootForCache.querySelectorAll(".tab-item"));
  }

  config.tabSelectedIndex = activeTabIndex;
}

export async function openSwitcher(isReverse = false): Promise<void> {
  createTabsDock();
  await renderTabs();

  const root = getHostRoot();
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

export function closeSwitcher(): void {
  const root = getHostRoot();
  if (!root) return;

  const overlay = root.getElementById("switcher-overlay") as HTMLDivElement;
  overlay.classList.add("hidden");

  clearCachedTabItems();

  setTimeout(() => {
    config.isTabOpen = false;
    removeHost();
  }, 280);
}
