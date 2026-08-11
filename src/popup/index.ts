import { config, initializeConfig } from "../core/config/config";
import { storage } from "../core/storage/storage.utils";
import googleLogo from "../assets/search-engine-logos/google.svg?inline";
import duckduckgoLogo from "../assets/search-engine-logos/duckduckgo.svg?inline";
import braveLogo from "../assets/search-engine-logos/brave.svg?inline";
import bingLogo from "../assets/search-engine-logos/bing.svg?inline";
import unduckLogo from "../assets/search-engine-logos/unduck.png";

interface SearchEngine {
  name: string;
  value: string;
  favicon: string;
}

const ENGINES: SearchEngine[] = [
  { name: "Google", value: "google", favicon: googleLogo },
  { name: "DuckDuckGo", value: "duckduckgo", favicon: duckduckgoLogo },
  { name: "Brave", value: "brave", favicon: braveLogo },
  { name: "Bing", value: "bing", favicon: bingLogo },
  { name: "Unduck", value: "unduck", favicon: unduckLogo },
];

let engineTriggerImg: HTMLImageElement;
let engineTriggerSpan: HTMLSpanElement;
let engineOptionsList: HTMLUListElement;
let pageContentToggle: HTMLInputElement;
let spotlightToggle: HTMLInputElement;
let tabsToggle: HTMLInputElement;
let glanceToggle: HTMLInputElement;

async function init(): Promise<void> {
  buildPopup();
  render();
  await initializeConfig();
  render();

  chrome.storage.onChanged.addListener(() => {
    render();
  });
}

function buildPopup(): void {
  const popup = document.createElement("div");
  popup.className = "scythe-popup";
  popup.appendChild(buildContent());
  document.body.appendChild(popup);
}

function card(row: HTMLElement): HTMLElement {
  const el = document.createElement("div");
  el.className = "scythe-card";
  el.appendChild(row);
  return el;
}

function buildContent(): HTMLElement {
  const content = document.createElement("div");
  content.className = "scythe-content";

  content.appendChild(
    card(
      settingRow(
        "Search engine",
        "Default engine for web search",
        buildEngineSelector(),
      ),
    ),
  );

  pageContentToggle = createToggle(config.hideNewTab, (checked) => {
    storage.sync.set({ showNewTab: checked });
    config.hideNewTab = checked;
  });
  content.appendChild(
    card(
      settingRow(
        "Page content",
        "Show or hide content on the new tab page",
        toggleContainer(pageContentToggle),
      ),
    ),
  );

  spotlightToggle = createToggle(config.isSpotlightEnabled, (checked) => {
    storage.sync.set({ isSpotlightEnabled: checked });
    config.isSpotlightEnabled = checked;
  });
  content.appendChild(
    card(
      settingRow(
        "Spotlight",
        "Quick search web",
        toggleContainer(spotlightToggle),
      ),
    ),
  );

  tabsToggle = createToggle(config.isTabEnabled, (checked) => {
    storage.sync.set({ isTabEnabled: checked });
    config.isTabEnabled = checked;
  });
  content.appendChild(
    card(
      settingRow(
        "Tab Switcher",
        "Quickly switch between open tabs",
        toggleContainer(tabsToggle),
      ),
    ),
  );

  glanceToggle = createToggle(config.isGlanceEnabled, (checked) => {
    storage.sync.set({ isGlanceEnabled: checked });
    config.isGlanceEnabled = checked;
  });
  content.appendChild(
    card(
      settingRow(
        "Glance",
        "Preview links without leaving the page",
        toggleContainer(glanceToggle),
      ),
    ),
  );

  return content;
}

function buildEngineSelector(): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.className = "scythe-engine-select-wrapper";

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "scythe-engine-select-trigger";

  engineTriggerImg = document.createElement("img");
  engineTriggerImg.alt = "";
  engineTriggerSpan = document.createElement("span");

  const arrow = document.createElement("span");
  arrow.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  `;

  trigger.appendChild(engineTriggerImg);
  trigger.appendChild(engineTriggerSpan);
  trigger.appendChild(arrow);

  engineOptionsList = document.createElement("ul");
  engineOptionsList.className = "scythe-engine-options";

  ENGINES.forEach((engine) => {
    const item = document.createElement("li");
    item.className = "scythe-engine-option-item";
    item.dataset.value = engine.value;

    const img = document.createElement("img");
    img.src = engine.favicon;
    img.alt = engine.name;

    const span = document.createElement("span");
    span.textContent = engine.name;

    item.appendChild(img);
    item.appendChild(span);
    engineOptionsList.appendChild(item);
  });

  wrapper.appendChild(trigger);
  wrapper.appendChild(engineOptionsList);

  trigger.addEventListener("click", () => {
    engineOptionsList.classList.toggle("scythe-open");
  });

  engineOptionsList.addEventListener("click", (event) => {
    const item = (event.target as HTMLElement).closest<HTMLElement>(
      ".scythe-engine-option-item",
    );
    if (!item?.dataset.value) return;
    const value = item.dataset.value;
    config.searchEngine = value;
    storage.sync.set({ searchEngine: value });
    engineOptionsList.classList.remove("scythe-open");
  });

  document.addEventListener("click", (event) => {
    if (!wrapper.contains(event.target as Node)) {
      engineOptionsList.classList.remove("scythe-open");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      engineOptionsList.classList.remove("scythe-open");
    }
  });

  return wrapper;
}

function settingRow(
  label: string,
  description: string,
  control: HTMLElement,
): HTMLElement {
  const row = document.createElement("div");
  row.className = "scythe-setting-row";

  const details = document.createElement("div");
  details.className = "scythe-setting-details";

  const lbl = document.createElement("label");
  lbl.textContent = label;
  const desc = document.createElement("span");
  desc.textContent = description;

  details.appendChild(lbl);
  details.appendChild(desc);
  row.appendChild(details);
  row.appendChild(control);
  return row;
}

function createToggle(
  checked: boolean,
  onChange: (checked: boolean) => void,
): HTMLInputElement {
  const input = document.createElement("input");
  input.type = "checkbox";
  input.className = "scythe-switch-input";
  input.checked = checked;
  input.addEventListener("change", () => onChange(input.checked));
  return input;
}

function toggleContainer(input: HTMLInputElement): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "scythe-toggle-container";

  const label = document.createElement("label");
  label.className = "scythe-switch";

  const slider = document.createElement("span");
  slider.className = "scythe-switch-slider";
  const thumb = document.createElement("span");
  thumb.className = "scythe-switch-thumb";
  slider.appendChild(thumb);

  label.appendChild(input);
  label.appendChild(slider);
  wrap.appendChild(label);
  return wrap;
}

function render(): void {
  const current =
    ENGINES.find((e) => e.value === config.searchEngine?.toLowerCase()) ??
    ENGINES[0];

  engineTriggerImg.src = current.favicon;
  engineTriggerImg.alt = current.name;
  engineTriggerSpan.textContent = current.name;

  for (const item of engineOptionsList.children) {
    item.classList.toggle(
      "selected",
      (item as HTMLElement).dataset.value === current.value,
    );
  }

  pageContentToggle.checked = config.hideNewTab;
  spotlightToggle.checked = config.isSpotlightEnabled;
  tabsToggle.checked = config.isTabEnabled;
  glanceToggle.checked = config.isGlanceEnabled;
}

init();
