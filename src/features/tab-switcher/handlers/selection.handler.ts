import { config } from "../../../core/config/config";
import { getHostRoot } from "../../../core/utils/host.utils";
import { MessageBroker } from "../../../core/messaging/message.broker";
import { closeSwitcher } from "../components/switcher.component";

let cachedTabItems: NodeListOf<Element> | null = null;

export function setCachedTabItems(items: NodeListOf<Element>): void {
  cachedTabItems = items;
}

export function getTabItemsCount(): number {
  return cachedTabItems?.length ?? 0;
}

export function clearCachedTabItems(): void {
  cachedTabItems = null;
}

export function updateSelection(index: number): void {
  const root = getHostRoot();
  if (!root) return;

  const tabTitle = root.getElementById(
    "active-tab-title",
  ) as HTMLDivElement | null;
  if (!tabTitle) return;

  config.tabSelectedIndex = index;
  const items = cachedTabItems ?? root.querySelectorAll(".tab-item");
  items.forEach((item, idx) => {
    if (idx === index) {
      item.classList.add("selected");
      tabTitle.textContent = item.getAttribute("data-title");
      item.scrollIntoView({
        behavior: "instant",
        block: "nearest",
        inline: "nearest",
      });
    } else {
      item.classList.remove("selected");
    }
  });
}

export function confirmSelection(): void {
  const root = getHostRoot();
  if (!root) return;

  const items = cachedTabItems ?? root.querySelectorAll(".tab-item");
  const chosenTab = items[config.tabSelectedIndex];

  closeSwitcher();

  MessageBroker.send({
    action: "switchTab",
    id: chosenTab.id,
  });
}
