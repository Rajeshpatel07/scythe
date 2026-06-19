export const config = {
  selectedResultIndex: -1,
  currentSuggestion: "",
  isModelOpen: false,
  openNewtab: false,
  searchEngine:
    typeof localStorage !== "undefined"
      ? localStorage.getItem("searchEngine")
      : null,
  shownewtab:
    typeof localStorage !== "undefined"
      ? localStorage.getItem("shownewtab") === "true"
      : false,

  isTabOpen: false,
  tabSelectedIndex: 0,
  modifierPressed: false,
};
