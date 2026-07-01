export function getShadowHost(id: string): HTMLElement | null {
  return document.getElementById(id);
}

function getSpotlightRoot(): ShadowRoot | null {
  return getShadowHost("ext-spotlight-host")?.shadowRoot ?? null;
}

function getSwitcherRoot(): ShadowRoot | null {
  return getShadowHost("ext-switcher-host")?.shadowRoot ?? null;
}

export function getSearchInput(): HTMLInputElement | null {
  const root = getSpotlightRoot();
  if (!root) return null;
  return root.getElementById("spotlight-search-input-ext") as HTMLInputElement;
}

export function getFirstResultItem(): HTMLLIElement | null {
  const root = getSpotlightRoot();
  if (!root) return null;
  return root.querySelector(
    ".spotlight-result-item-ext",
  ) as HTMLLIElement | null;
}

export function getSelectedResultItem(): HTMLLIElement | null {
  const root = getSpotlightRoot();
  if (!root) return null;
  return root.querySelector(
    ".spotlight-result-item-ext.selected",
  ) as HTMLLIElement | null;
}

export { getSpotlightRoot, getSwitcherRoot };
