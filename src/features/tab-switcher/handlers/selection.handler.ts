import { config } from "../../../core/config/config";
import { getSwitcherRoot } from "../../../core/utils/dom.utils";
import { MessageBroker } from "../../../core/messaging/message.broker";
import { closeSwitcher } from "../components/switcher.component";

export function updateSelection(index: number) {
  const root = getSwitcherRoot();
  if (!root) return;

  const tabTitle = root.getElementById(
    "active-tab-title",
  ) as HTMLDivElement;

  config.tabSelectedIndex = index;
  const items = root.querySelectorAll(".tab-item");
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
  const root = getSwitcherRoot();
  if (!root) return;

  const items = root.querySelectorAll(".tab-item");
  const chosenTab = items[config.tabSelectedIndex];

  closeSwitcher();

  MessageBroker.send({
    action: "switchTab",
    id: chosenTab.id,
  });
}
