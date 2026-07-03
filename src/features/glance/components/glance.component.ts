import { config } from "../../../core/config/config";

export function hideGlance() {
  const host = document.getElementById("ext-glance-host");
  if (!host) return;

  document.body.style.overflow = "";

  setTimeout(() => {
    config.isGlanceOpen = false;
    host.remove();
  }, 200);
}

export function openGlanceModal(url: string) {
  const host = document.createElement("div");
  host.id = "ext-glance-host";
  host.setAttribute(
    "style",
    "position:fixed; bottom:0; right:0; z-index:2147483647;",
  );
  document.body.appendChild(host);

  document.body.style.overflow = "hidden";
  const shadowRoot = host.attachShadow({ mode: "open" });

  const stylesheetLink = document.createElement("link");
  stylesheetLink.setAttribute("rel", "stylesheet");
  stylesheetLink.setAttribute(
    "href",
    chrome.runtime.getURL("src/core/styles/glance.css"),
  );
  shadowRoot.appendChild(stylesheetLink);

  // 3. Screen Overlay Backdrop Component
  const overlay = document.createElement("div");
  overlay.id = "glance-extension-modal";
  overlay.className = "glance-overlay";

  const actionContainer = document.createElement("div");
  actionContainer.className = "glance-action-container";

  const tabButton = document.createElement("button");
  tabButton.id = "glance-tab-btn";
  tabButton.className = "glance-action-btn glance-btn-primary";
  tabButton.title = "Open in New Tab";
  tabButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
      <polyline points="15 3 21 3 21 9"></polyline>
      <line x1="10" y1="14" x2="21" y2="3"></line>
    </svg>
  `;
  tabButton.onclick = () => {
    hideGlance();
    window.open(url, "_blank");
  };

  const closeButton = document.createElement("button");
  closeButton.id = "glance-close-btn";
  closeButton.className = "glance-action-btn glance-btn-danger";
  closeButton.title = "Close Modal";
  closeButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  `;
  closeButton.onclick = () => {
    hideGlance();
  };

  actionContainer.appendChild(tabButton);
  actionContainer.appendChild(closeButton);

  const iframe = document.createElement("iframe");
  iframe.className = "glance-content-frame";

  chrome.runtime
    .sendMessage({ action: "clearSW", url })
    .catch(() => {})
    .then(() => {
      iframe.src = url;
    });

  overlay.appendChild(actionContainer);
  overlay.appendChild(iframe);
  shadowRoot.appendChild(overlay);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      hideGlance();
    }
  });
}
