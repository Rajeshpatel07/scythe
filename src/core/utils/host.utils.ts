import baseCss from "../styles/base.css?raw";
import styleCss from "../styles/style.css?raw";
import tabsCss from "../styles/tabs.css?raw";
import glanceCss from "../styles/glance.css?raw";

const HOST_ID = "scythe-host";

type Feature = "spotlight" | "switcher" | "glance";

const featureStyles: Record<Feature, string> = {
  spotlight: baseCss + styleCss,
  switcher: baseCss + tabsCss,
  glance: baseCss + glanceCss,
};

const featureRootIds: Record<Feature, string> = {
  spotlight: "spotlight-overlay-ext",
  switcher: "switcher-overlay",
  glance: "glance-extension-modal",
};

let cachedRoot: ShadowRoot | null = null;
const pendingCleanups = new Map<Feature, ReturnType<typeof setTimeout>>();
const activeFeatures = new Set<Feature>();

// Matches the longest closing animation across feature stylesheets (0.25s).
const FEATURE_TEARDOWN_MS = 280;

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
  const pending = pendingCleanups.get(feature);
  if (pending !== undefined) {
    clearTimeout(pending);
    pendingCleanups.delete(feature);
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

  const existing = pendingCleanups.get(feature);
  if (existing !== undefined) {
    clearTimeout(existing);
  }

  const style = getHostRoot()?.querySelector(
    `style[data-feature="${feature}"]`,
  );

  const timer = setTimeout(() => {
    pendingCleanups.delete(feature);

    // The feature was reopened before its closing animation finished;
    // ensureHost already replaced the stale nodes, so keep them.
    if (activeFeatures.has(feature)) return;

    getHostRoot()?.getElementById(featureRootIds[feature])?.remove();
    style?.remove();

    if (activeFeatures.size === 0 && pendingCleanups.size === 0) {
      document.getElementById(HOST_ID)?.remove();
      cachedRoot = null;
    }
  }, FEATURE_TEARDOWN_MS);

  pendingCleanups.set(feature, timer);
}

export function getHostRoot(): ShadowRoot | null {
  if (cachedRoot) return cachedRoot;
  const host = document.getElementById(HOST_ID);
  return host?.shadowRoot ?? null;
}
