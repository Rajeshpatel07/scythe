export function getShadowHost(): HTMLElement | null {
  return document.getElementById("spotlight-host");
}

export function getShadowRoot(): ShadowRoot | null {
  const host = getShadowHost();
  return host?.shadowRoot ?? null;
}

export function getSearchInput(): HTMLInputElement | null {
  const shadowRoot = getShadowRoot();
  if (!shadowRoot) return null;
  return shadowRoot.getElementById(
    "spotlight-search-input-ext",
  ) as HTMLInputElement;
}

export function getFirstResultItem(): HTMLLIElement | null {
  const shadowRoot = getShadowRoot();
  if (!shadowRoot) return null;
  return shadowRoot.querySelector(
    ".spotlight-result-item-ext",
  ) as HTMLLIElement | null;
}

export function getSelectedResultItem(): HTMLLIElement | null {
  const shadowRoot = getShadowRoot();
  if (!shadowRoot) return null;
  return shadowRoot.querySelector(
    ".spotlight-result-item-ext.selected",
  ) as HTMLLIElement | null;
}
