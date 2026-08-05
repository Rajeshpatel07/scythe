import styleCss from "../styles/style.css?raw";
import tabsCss from "../styles/tabs.css?raw";
import glanceCss from "../styles/glance.css?raw";

const HOST_ID = "scythe-host";

type Feature = "spotlight" | "switcher" | "glance";

const featureStyles: Record<Feature, string> = {
  spotlight: styleCss,
  switcher: tabsCss,
  glance: glanceCss,
};

const featureRootIds: Record<Feature, string> = {
  spotlight: "spotlight-overlay-ext",
  switcher: "switcher-overlay",
  glance: "glance-extension-modal",
};

let cachedRoot: ShadowRoot | null = null;
let pendingRemoveTimeout: ReturnType<typeof setTimeout> | null = null;
const activeFeatures = new Set<Feature>();

function getOrCreateHost(): ShadowRoot {
  if (cachedRoot) return cachedRoot;

  let host = document.getElementById(HOST_ID) as HTMLElement | null;
  if (!host) {
    host = document.createElement("div");
    host.id = HOST_ID;
    host.setAttribute(
      "style",
      "position:fixed;bottom:0;right:0;z-index:2147483647;",
    );
    document.body.appendChild(host);
    host.attachShadow({ mode: "open" });
  }

  cachedRoot = host.shadowRoot as ShadowRoot;
  return cachedRoot;
}

function ensureStyle(root: ShadowRoot, feature: Feature): void {
  if (root.querySelector(`style[data-feature="${feature}"]`)) return;
  const style = document.createElement("style");
  style.setAttribute("data-feature", feature);
  style.textContent = featureStyles[feature];
  root.appendChild(style);
}

export function ensureHost(feature: Feature): ShadowRoot {
  if (pendingRemoveTimeout !== null) {
    clearTimeout(pendingRemoveTimeout);
    pendingRemoveTimeout = null;
  }

  const root = getOrCreateHost();
  activeFeatures.add(feature);

  // Drop a stale instance of this feature's root node so rapid reopen cycles
  // never produce duplicate ids inside the shared shadow root.
  root.getElementById(featureRootIds[feature])?.remove();

  ensureStyle(root, feature);
  return root;
}

export function removeHost(feature: Feature): void {
  activeFeatures.delete(feature);

  const root = getHostRoot();
  const style = root?.querySelector(`style[data-feature="${feature}"]`);

  const cleanup = () => {
    const currentRoot = getHostRoot();
    currentRoot?.getElementById(featureRootIds[feature])?.remove();
    style?.remove();
  };

  if (activeFeatures.size === 0) {
    if (pendingRemoveTimeout !== null) {
      clearTimeout(pendingRemoveTimeout);
    }
    pendingRemoveTimeout = setTimeout(() => {
      cleanup();
      const host = document.getElementById(HOST_ID);
      if (host) {
        host.remove();
      }
      cachedRoot = null;
      pendingRemoveTimeout = null;
    }, 280);
    return;
  }

  // Other features are still open: only tear down this feature's nodes after
  // its closing animation, leaving the shared host and siblings untouched.
  setTimeout(cleanup, 280);
}

export function getHostRoot(): ShadowRoot | null {
  if (cachedRoot) return cachedRoot;
  const host = document.getElementById(HOST_ID);
  return host?.shadowRoot ?? null;
}
