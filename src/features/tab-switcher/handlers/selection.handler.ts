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

  const items = cachedTabItems ?? root.querySelectorAll(".tab-item");
  const count = items.length;

  // Safety check to handle out-of-bounds, empty lists, or NaN indexes
  if (count === 0 || Number.isNaN(index) || index < 0 || index >= count) {
    return;
  }

  // Remove class from previously selected item if it exists
  const previouslySelected = root.querySelector(".tab-item.selected");
  if (previouslySelected) {
    previouslySelected.classList.remove("selected");
  }

  // Set the selection on the new active item
  const targetItem = items[index];
  if (targetItem) {
    targetItem.classList.add("selected");
    tabTitle.textContent = targetItem.getAttribute("data-title");
    targetItem.scrollIntoView({
      behavior: "instant",
      block: "nearest",
      inline: "nearest",
    });
  }

  config.tabSelectedIndex = index;
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
