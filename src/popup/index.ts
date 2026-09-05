import { config, initializeConfig } from "../core/config/config";
import { storage } from "../core/storage/storage.utils";
import { el } from "../shared/ui/dom-factory";
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
  const popup = el("div", { className: "scythe-popup" }, [buildContent()]);
  document.body.appendChild(popup);
}

function card(row: HTMLElement): HTMLElement {
  return el("div", { className: "scythe-card" }, [row]);
}

interface ToggleSettingDef {
  label: string;
  description: string;
  initial: () => boolean;
  onChange: (checked: boolean) => void;
  save: (input: HTMLInputElement) => void;
}

const TOGGLE_SETTINGS: ToggleSettingDef[] = [
  {
    label: "Page content",
    description: "Show or hide content on the new tab page",
    initial: () => config.hideNewTab,
    onChange: (checked) => {
      storage.sync.set({ showNewTab: checked }).catch(() => {});
      config.hideNewTab = checked;
    },
    save: (input) => {
      pageContentToggle = input;
    },
  },
  {
    label: "Spotlight",
    description: "Quick search web",
    initial: () => config.isSpotlightEnabled,
    onChange: (checked) => {
      storage.sync.set({ isSpotlightEnabled: checked }).catch(() => {});
      config.isSpotlightEnabled = checked;
    },
    save: (input) => {
      spotlightToggle = input;
    },
  },
  {
    label: "Tab Switcher",
    description: "Quickly switch between open tabs",
    initial: () => config.isTabEnabled,
    onChange: (checked) => {
      storage.sync.set({ isTabEnabled: checked }).catch(() => {});
      config.isTabEnabled = checked;
    },
    save: (input) => {
      tabsToggle = input;
    },
  },
  {
    label: "Glance",
    description: "Preview links without leaving the page",
    initial: () => config.isGlanceEnabled,
    onChange: (checked) => {
      storage.sync.set({ isGlanceEnabled: checked }).catch(() => {});
      config.isGlanceEnabled = checked;
    },
    save: (input) => {
      glanceToggle = input;
    },
  },
];

function buildContent(): HTMLElement {
  const content = el("div", { className: "scythe-content" });

  content.appendChild(
    card(
      settingRow(
        "Search engine",
        "Default engine for web search",
        buildEngineSelector(),
      ),
    ),
  );

  for (const def of TOGGLE_SETTINGS) {
    const toggle = createToggle(def.initial(), def.onChange);
    def.save(toggle);
    content.appendChild(
      card(settingRow(def.label, def.description, toggleContainer(toggle))),
    );
  }

  return content;
}

function buildEngineSelector(): HTMLElement {
  const wrapper = el("div", { className: "scythe-engine-select-wrapper" });

  const trigger = el("button", { className: "scythe-engine-select-trigger" });
  trigger.type = "button";

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

  engineOptionsList = el("ul", { className: "scythe-engine-options" });

  ENGINES.forEach((engine) => {
    const item = el("li", { className: "scythe-engine-option-item" });
    item.dataset.value = engine.value;

    const img = document.createElement("img");
    img.src = engine.favicon;
    img.alt = engine.name;

    const span = el("span", { text: engine.name });

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
    storage.sync.set({ searchEngine: value }).catch(() => {});
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
  const lbl = el("label", { text: label });
  const desc = el("span", { text: description });
  const details = el("div", { className: "scythe-setting-details" }, [
    lbl,
    desc,
  ]);
  return el("div", { className: "scythe-setting-row" }, [details, control]);
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
  const thumb = el("span", { className: "scythe-switch-thumb" });
  const slider = el("span", { className: "scythe-switch-slider" }, [thumb]);
  const label = el("label", { className: "scythe-switch" }, [input, slider]);
  return el("div", { className: "scythe-toggle-container" }, [label]);
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
