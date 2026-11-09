import {
  loadFaviconFromCache,
  getHighResFallback,
  persistFavicon,
  loadFaviconWithLogoFallback,
} from "../../../core/services/favicon.service";
import { isLocalhostUrl } from "../../../core/utils/url.utils";
import { config } from "../../../core/config/config";
import type { TabsResponse } from "../../../core/types/domain.types";
import {
  ensureHost,
  getHostRoot,
  removeHost,
} from "../../../core/utils/host.utils";
import { storage } from "../../../core/storage/storage.utils";
import { MessageBroker } from "../../../core/messaging/message.broker";
import { createElement } from "../../../shared/ui/dom-factory";
import {
  updateSelection,
  confirmSelection,
} from "../actions/selection.actions";
import {
  setCachedTabItems,
  clearCachedTabItems,
  setSwitcherReady,
  consumePendingConfirm,
} from "../state/selection.store";

function focusSwitcher(): void {
  const root = getHostRoot();
  if (!root) return;

  const selectedItem = root.querySelector<HTMLElement>(".tab-item.selected");
  const target = selectedItem ?? root.getElementById("switcher-overlay");
  target?.focus({ preventScroll: true });
}

function createTabsDock(): void {
  const shadowRoot = ensureHost("switcher");

  const tabList = createElement("div", {
    id: "tab-list",
    className: "tab-list",
  });
  const tabTitle = createElement("div", {
    id: "active-tab-title",
    className: "active-title",
  });
  const container = createElement("div", { className: "switcher-container" }, [
    tabList,
    tabTitle,
  ]);
  const overlay = createElement(
    "div",
    { id: "switcher-overlay", className: "overlay hidden" },
    [container],
  );
  overlay.tabIndex = -1;

  // Keep focus inside the switcher when the overlay is clicked. The mouse is
  // intentionally inert: it must not change or confirm the selection.
  overlay.addEventListener("mousedown", (event) => {
    event.preventDefault();
    event.stopPropagation();
    focusSwitcher();
  });
  overlay.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  shadowRoot.appendChild(overlay);
}

let renderVersion = 0;

async function renderTabs(): Promise<void> {
  const root = getHostRoot();
  if (!root) return;
  renderVersion++;
  const currentVersion = renderVersion;

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

  // 1. Gather storage keys for all tab hostnames to perform a single batched local storage read
  const tabHostnames = response.tabs.map((tab) => {
    try {
      return new URL(tab.url).hostname;
    } catch {
      return "";
    }
  });

  // Localhost tabs are never matched here (favicons are fetched fresh from
  // Chrome's favicon service instead of the per-hostname storage cache, and a
  // stale fav_localhost entry would be wrong for the site this tab hosts).
  const storageKeys = tabHostnames
    .map((hostname, index) => ({
      hostname,
      url: response.tabs[index]?.url ?? "",
    }))
    .filter(({ hostname, url }) => hostname !== "" && !isLocalhostUrl(url))
    .map(({ hostname }) => `fav_${hostname}`);

  let cachedFavicons: Record<string, string> = {};
  if (storageKeys.length > 0) {
    try {
      cachedFavicons = await storage.local.get<string>(storageKeys);
    } catch {
      // Ignore storage read failures
    }
  }

  // 2. Loop through tabs and construct elements using batched cache
  let activeTabIndex = 0;
  response.tabs.forEach((tab, index) => {
    if (tab.active) {
      activeTabIndex = index;
    }

    const currentTargetUrl = tab.url;
    let hostname = "";
    let isChromeSchema = false;
    try {
      if (currentTargetUrl) {
        const parsedUrl = new URL(currentTargetUrl);
        hostname = parsedUrl.hostname;
        isChromeSchema = parsedUrl.protocol === "chrome:";
      }
    } catch {
      // safe fallback for invalid or empty URLs
    }

    const tabItem = document.createElement("div");
    tabItem.classList.add("tab-item");
    tabItem.setAttribute("id", tab.id);
    tabItem.setAttribute("data-index", String(index));
    tabItem.setAttribute("data-title", tab.title);
    tabItem.tabIndex = -1;

    const img = document.createElement("img");
    img.classList.add("tab-icon");
    img.alt = tab.title || "";

    img.setAttribute("data-loading-url", currentTargetUrl);

    const isLocalhost = isLocalhostUrl(currentTargetUrl);

    // Retrieve from our batched cache read (localhost tabs always go to the
    // favicon service instead of the storage cache)
    const storageKey = !isLocalhost && hostname ? `fav_${hostname}` : "";
    const cachedDataUrl = storageKey ? cachedFavicons[storageKey] : undefined;

    if (cachedDataUrl && cachedDataUrl !== "null") {
      img.src = cachedDataUrl;
    } else if (isLocalhost) {
     loadFaviconWithLogoFallback(currentTargetUrl, img, 128);
    } else if (hostname && !isChromeSchema) {
      // High-res fetch covers this case; skip the redundant low-res request
      // and show the extension icon until it lands.
      img.src = chrome.runtime.getURL("src/assets/icon48.png");

      getHighResFallback(hostname)
        .then((highResResult) => {
          if (currentVersion !== renderVersion) return;
          if (highResResult.status === "success" && highResResult.dataUrl) {
            if (img.getAttribute("data-loading-url") === currentTargetUrl) {
              img.style.opacity = "0.4";
              const src = highResResult.dataUrl;
              setTimeout(() => {
                if (currentVersion === renderVersion && src) {
                  img.src = src;
                  img.style.opacity = "1";
                }
              }, 60);
              persistFavicon(hostname, highResResult.dataUrl, () => {
                return currentVersion === renderVersion;
              });
            }
          }
        })
        .catch(() => {});
    } else {
      loadFaviconFromCache(tab.url, img, 128);
    }

    tabItem.appendChild(img);

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
  setSwitcherReady(false);
  createTabsDock();
  await renderTabs();

  const root = getHostRoot();
  if (!root || !config.isTabOpen) return;

  const overlay = root.getElementById("switcher-overlay") as HTMLDivElement;
  const items = root.querySelectorAll(".tab-item");
  const tabsLen = items.length;

  config.isTabOpen = true;

  if (isReverse) {
    updateSelection((config.tabSelectedIndex - 1 + tabsLen) % tabsLen);
  } else {
    updateSelection((config.tabSelectedIndex + 1) % tabsLen);
  }

  setSwitcherReady(true);

  // Releasing Ctrl while the list was still loading defers the confirm; honour
  // it now, before the dock is painted, so a quick tap still switches tabs.
  if (consumePendingConfirm() && confirmSelection()) {
    return;
  }

  overlay.classList.remove("hidden");
  focusSwitcher();
}

export function closeSwitcher(immediate = false): void {
  // Disable input routing immediately to prevent race conditions during animation
  config.isTabOpen = false;

  const root = getHostRoot();
  if (!root) return;

  const overlay = root.getElementById("switcher-overlay") as HTMLDivElement;
  overlay?.classList.add("hidden");

  clearCachedTabItems();

  removeHost("switcher", immediate);

  if (config.isGlanceOpen) {
    const glanceFrame = root.getElementById(
      "glance-content-frame",
    ) as HTMLIFrameElement | null;
    glanceFrame?.focus();
  }
}
