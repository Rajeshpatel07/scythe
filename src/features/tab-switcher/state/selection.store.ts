let cachedTabItems: NodeListOf<Element> | null = null;
let switcherReady = false;
let pendingConfirm = false;

export function setCachedTabItems(items: NodeListOf<Element>): void {
  cachedTabItems = items;
}

export function getTabItemsCount(): number {
  return cachedTabItems?.length ?? 0;
}

export function clearCachedTabItems(): void {
  cachedTabItems = null;
  switcherReady = false;
  pendingConfirm = false;
}

export function getCachedTabItems(): NodeListOf<Element> | null {
  return cachedTabItems;
}

export function setSwitcherReady(ready: boolean): void {
  switcherReady = ready;
}

export function isSwitcherReady(): boolean {
  return switcherReady;
}

export function setPendingConfirm(): void {
  pendingConfirm = true;
}

export function consumePendingConfirm(): boolean {
  const pending = pendingConfirm;
  pendingConfirm = false;
  return pending;
}
