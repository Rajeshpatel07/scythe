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

export function getCachedTabItems(): NodeListOf<Element> | null {
  return cachedTabItems;
}
