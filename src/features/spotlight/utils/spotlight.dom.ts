import { getHostRoot } from "../../../core/utils/host.utils";
import { SPOTLIGHT_CLASSES, SPOTLIGHT_IDS } from "../spotlight.constants";

function queryInHost(selector: string): Element | null {
  const root = getHostRoot();
  if (!root) return null;
  return root.querySelector(selector);
}

export function getSearchInput(): HTMLInputElement | null {
  return queryInHost(
    `#${SPOTLIGHT_IDS.searchInput}`,
  ) as HTMLInputElement | null;
}

export function getFirstResultItem(): HTMLLIElement | null {
  return queryInHost(
    `.${SPOTLIGHT_CLASSES.resultItem}`,
  ) as HTMLLIElement | null;
}

export function getSelectedResultItem(): HTMLLIElement | null {
  return queryInHost(
    `.${SPOTLIGHT_CLASSES.resultItem}.${SPOTLIGHT_CLASSES.selected}`,
  ) as HTMLLIElement | null;
}
