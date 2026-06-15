import { config } from "../../../core/config/config";
import { getShadowRoot } from "../../../core/utils/dom.utils";
import { MessageBroker } from "../../../core/messaging/message.broker";
import { closeSwitcher } from "../components/switcher.component";

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

  MessageBroker.send({
    action: "switchTab",
    id: chosenTab.id,
  });
}
