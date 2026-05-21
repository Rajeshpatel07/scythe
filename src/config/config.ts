export const config = {
  selectedResultIndex: -1,
  currentSuggestion: "",
  isModelOpen: false,
  openNewtab: false,
  searchEngine: localStorage.getItem("searchEngine"),
  shownewtab: localStorage.getItem("shownewtab") === "true",

  tabIsOpen: false,
  tabSelectedIndex: 0,
  modifierPressed: false,
};
