import { getHostRoot } from "./host.utils";

function getSpotlightRoot(): ShadowRoot | null {
  return getHostRoot();
}

function getSwitcherRoot(): ShadowRoot | null {
  return getHostRoot();
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
