export function sidebarItem(label: string, txt: string) {
  const host = document.createElement("div");
  host.className = "spotlight-setting-item";
  const settingDetails = document.createElement("div");
  settingDetails.className = "spotlight-setting-details";
  const settingsLabel = document.createElement("label");
  settingsLabel.textContent = label;
  settingDetails.appendChild(settingsLabel);
  const settingspan = document.createElement("span");
  settingspan.textContent = txt;
  settingDetails.appendChild(settingspan);
  host.appendChild(settingDetails);
  return host;
}
