import { createListItem } from "../ui/list";
import { config } from "../config";

export function populateHistory() {
  const resultsList = document.getElementById(
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
        response.history.forEach((item) => {
          const li = createListItem(item.title || item.url, item.url);
          resultsList.appendChild(li);
        });
      }
    } else {
      resultsList.innerHTML = "<li>Could not load history.</li>";
    }
  });
}
