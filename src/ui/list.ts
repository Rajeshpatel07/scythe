import { config } from "../config";

export function createListItem(title: string, url: string) {
  const li = document.createElement("li");
  li.className = "spotlight-result-item-ext";
  li.setAttribute("data-url", url);
  li.addEventListener("click", () => (window.location.href = url));

  const favicon = document.createElement("img");
  favicon.className = "spotlight-favicon-ext";
  let hostname = "...";
  try {
    hostname = new URL(url).hostname;
  } catch (_e) {
    /* invalid URL */
  }

  favicon.src = `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;

  const textContent = document.createElement("div");
  textContent.className = "spotlight-text-content-ext";
  const titleEl = document.createElement("span");
  titleEl.className = "spotlight-title-ext";
  titleEl.textContent = title;
  const urlEl = document.createElement("span");
  urlEl.className = "spotlight-url-ext";
  if (url.length > 0) {
    urlEl.textContent = `— ${url}`;
  }

  textContent.appendChild(titleEl);
  textContent.appendChild(urlEl);
  li.appendChild(favicon);
  li.appendChild(textContent);
  return li;
}

export function navigateResults(direction: "ArrowDown" | "ArrowUp") {
  const results = document.querySelectorAll(".spotlight-result-item-ext");
  if (results.length === 0) return;

  if (config.selectedResultIndex !== -1) {
    results[config.selectedResultIndex].classList.remove("selected");
  }

  if (direction === "ArrowDown") {
    config.selectedResultIndex =
      (config.selectedResultIndex + 1) % results.length;
  } else if (direction === "ArrowUp") {
    config.selectedResultIndex =
      (config.selectedResultIndex - 1 + results.length) % results.length;
  }

  results[config.selectedResultIndex].classList.add("selected");
  results[config.selectedResultIndex].scrollIntoView({ block: "nearest" });
}
