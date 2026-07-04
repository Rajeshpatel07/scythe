const HOST_ID = "scythe-host";

type Feature = "spotlight" | "switcher" | "glance";

const featureStyles: Record<Feature, string> = {
  spotlight: "src/core/styles/style.css",
  switcher: "src/core/styles/tabs.css",
  glance: "src/core/styles/glance.css",
};

export function ensureHost(feature: Feature): ShadowRoot {
  let host = document.getElementById(HOST_ID) as HTMLElement | null;
  if (!host) {
    host = document.createElement("div");
    host.id = HOST_ID;
    host.setAttribute(
      "style",
      "position:fixed;bottom:0;right:0;z-index:2147483647;",
    );
    document.body.appendChild(host);
    const root = host.attachShadow({ mode: "open" });
    const stylesheetLink = document.createElement("link");
    stylesheetLink.setAttribute("rel", "stylesheet");
    stylesheetLink.setAttribute(
      "href",
      chrome.runtime.getURL(featureStyles[feature]),
    );
    root.appendChild(stylesheetLink);
    return root;
  }
  return host.shadowRoot!;
}

export function removeHost(): void {
  const host = document.getElementById(HOST_ID);
  if (host) {
    host.remove();
  }
}

export function getHostRoot(): ShadowRoot | null {
  const host = document.getElementById(HOST_ID);
  return host?.shadowRoot ?? null;
}
