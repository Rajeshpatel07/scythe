import { showSpotlight } from "../main";

export function createNewTabPage(): void {
  const body = document.body;
  body.id = "body";

  // Create <main class="container">
  const main = document.createElement("main");
  main.className = "container";

  // Create wrapper
  const wrapper = document.createElement("div");
  wrapper.className = "wrapper";

  // Create header (title-wrapper)
  const header = document.createElement("header");
  header.className = "title-wrapper";

  // Create logo image
  const logo = document.createElement("img");
  logo.id = "logo";
  logo.src = "src/assets/icon128.webp";
  logo.alt = "Spotlight Logo";
  logo.width = 64; // fallback in case CSS doesn't load
  logo.height = 64;

  // Create title h1
  const title = document.createElement("h1");
  title.className = "title bricolage-grotesque-latin";
  title.textContent = "Spotlight";

  // Append logo and title to header
  header.appendChild(logo);
  header.appendChild(title);

  // Create input-wrapper div
  const inputWrapper = document.createElement("div");
  inputWrapper.className = "input-wrapper";

  // Create input element
  const input = document.createElement("input");
  input.type = "text";
  input.id = "search-input";
  input.className = "bricolage-grotesque-latin";
  input.placeholder = "Search or type a URL";
  input.autocomplete = "off";
  // input.autocorrect = "off";
  input.onclick = showSpotlight;

  inputWrapper.appendChild(input);

  // Assemble structure
  wrapper.appendChild(header);
  wrapper.appendChild(inputWrapper);
  main.appendChild(wrapper);
  body.appendChild(main);
}
