export interface ConfigState {
  selectedResultIndex: number;
  currentSuggestion: string;
  isSpotlightOpen: boolean;
  openNewtab: boolean;
  searchEngine: string | null;
  hideNewTab: boolean;
  isTabOpen: boolean;
  tabSelectedIndex: number;
  modifierPressed: boolean;
  isGlanceOpen: boolean;
  isSpotlightEnabled: boolean;
  isTabEnabled: boolean;
  isGlanceEnabled: boolean;
}
