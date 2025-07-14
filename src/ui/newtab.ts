import { showSpotlight } from "../main";

export function createNewTabPage(): void {
  const body = document.body;
  body.id = "body";

  const main = document.createElement("main");
  main.className = "container";

  const wrapper = document.createElement("div");
  wrapper.className = "wrapper";

  const header = document.createElement("header");
  header.className = "title-wrapper";

  const logo = document.createElement("img");
  logo.id = "logo";
  logo.src = "src/assets/icon128.webp";
  logo.alt = "Spotlight Logo";
  logo.width = 64;
  logo.height = 64;

  const title = document.createElement("h1");
  title.className = "title bricolage-grotesque-latin";
  title.textContent = "Spotlight";

  header.appendChild(logo);
  header.appendChild(title);

  const inputWrapper = document.createElement("div");
  inputWrapper.className = "input-wrapper";

  const input = document.createElement("input");
  input.type = "text";
  input.id = "search-input";
  input.className = "bricolage-grotesque-latin";
  input.placeholder = "Search or type a URL";
  input.autocomplete = "off";

  input.onclick = showSpotlight;

  inputWrapper.appendChild(input);

  wrapper.appendChild(header);
  wrapper.appendChild(inputWrapper);
  main.appendChild(wrapper);
  body.appendChild(main);
}
