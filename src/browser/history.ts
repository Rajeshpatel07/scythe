import { createListItem } from "../ui/list";
import { config } from "../config";

export function populateHistory() {
  const shadowHost = document.getElementById("spotlight-host");
  const shadowRoot = shadowHost?.shadowRoot;
  if (!shadowRoot) return;
  const resultsList = shadowRoot.getElementById(
    "spotlight-results-ext",
  ) as HTMLUListElement;
  resultsList.innerHTML = "<li>Loading recent history...</li>";
  config.selectedResultIndex = -1;

  chrome.runtime.sendMessage({ action: "getHistory" }, (response) => {
    if (response?.history) {
      resultsList.innerHTML = "";
      if (response.history.length === 0) {
        resultsList.innerHTML = "<li>No recent history.</li>";
      } else {
        //@ts-ignore
        const filterdDomains: Array<T> = response.history.filter((item) =>
          filterDomainsOnly(item.url),
        );
        filterdDomains.slice(0, 8).forEach((item) => {
          const li = createListItem(item.title || item.url, item.url);
          resultsList.appendChild(li);
        });
      }
    } else {
      resultsList.innerHTML = "<li>Could not load history.</li>";
    }
  });
}

function filterDomainsOnly(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.pathname === "/" && !parsed.search && !parsed.hash;
  } catch (_err) {
    return false;
  }
}
