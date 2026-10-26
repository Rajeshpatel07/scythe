export interface ConfigState {
  selectedResultIndex: number;
  currentAutocompletion: string;
  isSpotlightOpen: boolean;
  openInNewTab: boolean;
  searchEngine: string | null;
  hideNewTabContent: boolean;
  isTabOpen: boolean;
  tabSelectedIndex: number;
  isGlanceOpen: boolean;
  isSpotlightEnabled: boolean;
  isTabEnabled: boolean;
  isGlanceEnabled: boolean;
}
