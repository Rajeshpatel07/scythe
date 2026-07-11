import { config } from "../../../core/config/config";
import {
  ensureHost,
  removeHost,
  getHostRoot,
} from "../../../core/utils/host.utils";
import { openUrl } from "../../../core/services/navigation.service";
import { MessageBroker } from "../../../core/messaging/message.broker";

function silenceError(err: unknown): void {
  if (
    err instanceof Error &&
    err.message !==
      "Could not establish connection. Receiving end does not exist."
  ) {
    // biome-ignore lint/suspicious/noConsole: diagnostic logging
    console.error("glance error:", err);
  }
}

export function hideGlance(): void {
  document.body.style.overflow = "";

  const root = getHostRoot();
  root?.getElementById("glance-extension-modal")?.classList.add("closing");

  setTimeout(() => {
    config.isGlanceOpen = false;
    removeHost();
    MessageBroker.send({ action: "closeGlance" }).catch(silenceError);
  }, 280);
}

export function openGlanceModal(url: string): void {
  const shadowRoot = ensureHost("glance");

  document.body.style.overflow = "hidden";

  // 3. Screen Overlay Backdrop Component
  const overlay = document.createElement("div");
  overlay.id = "glance-extension-modal";
  overlay.className = "glance-overlay";

  const actionContainer = document.createElement("div");
  actionContainer.className = "glance-action-container";
  actionContainer.id = "glance-action-container";

  const tabButton = document.createElement("button");
  tabButton.id = "glance-tab-btn";
  tabButton.className = "glance-action-btn glance-btn-primary";
  tabButton.title = "Open in New Tab";
  tabButton.innerHTML = `
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 10L21 3M21 3H15M21 3V9M10 14L3 21M3 21H9M3 21L3 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
   </svg>
  `;
  tabButton.onclick = () => {
    MessageBroker.send({ action: "getGlanceUrl" })
      .then((response) => {
        openUrlInBackground(response.url || url);
        // openUrl(response?.url || url, true);
      })
      .catch(() => {
        // openUrl(url, true);
        openUrlInBackground(url);
      });
  };

  const closeButton = document.createElement("button");
  closeButton.id = "glance-close-btn";
  closeButton.className = "glance-action-btn glance-btn-danger";
  closeButton.title = "Close Modal";
  closeButton.innerHTML = `
<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
 <path d="M17 7L7 17M7 7L17 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
 </svg>
  `;
  closeButton.onclick = () => {
    hideGlance();
  };

  actionContainer.appendChild(tabButton);
  actionContainer.appendChild(closeButton);

  const iframe = document.createElement("iframe");
  iframe.className = "glance-content-frame";
  iframe.id = "glance-content-frame";

  MessageBroker.send({ action: "openGlance", url }).catch(silenceError);

  MessageBroker.send({ action: "clearSW", url })
    .catch(silenceError)
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

export async function openUrlInBackground(url: string) {
  const root = getHostRoot();
  const actionContainer = root?.getElementById(
    "glance-action-container",
  ) as HTMLDivElement;
  const iframe = root?.getElementById(
    "glance-content-frame",
  ) as HTMLIFrameElement;

  if (actionContainer) {
    actionContainer.style.display = "none";
  }
  if (iframe) {
    iframe.style.width = "100vw";
    iframe.style.height = "100vh";
  }

  try {
    const response = await MessageBroker.send({
      action: "createTab",
      url: url,
      active: false,
    });

    if (response?.success && response.tabId) {
      const tabId = response.tabId;
      hideGlance();
      MessageBroker.send({
        action: "switchTab",
        id: tabId.toString(),
      }).catch(silenceError);
    } else {
      openUrl(url);
    }
  } catch (_e) {
    openUrl(url);
  }
}
