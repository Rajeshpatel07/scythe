export const config = {
  selectedResultIndex: -1,
  currentSuggestion: "",
  isModelOpen: false,
  openNewtab: false,
  searchEngine: localStorage.getItem("searchEngine") || "Google",
  shownewtab: localStorage.getItem("shownewtab") === "true"
};
