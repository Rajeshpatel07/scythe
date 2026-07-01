export interface ConfigState {
  selectedResultIndex: number;
  currentSuggestion: string;
  isSpotlightOpen: boolean;
  openNewtab: boolean;
  searchEngine: string | null;
  shownewtab: boolean;
  isTabOpen: boolean;
  tabSelectedIndex: number;
  modifierPressed: boolean;
  isGlanceOpen: boolean;
}
