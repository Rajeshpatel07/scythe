export interface HistoryResponse {
  history: HistoryItem[];
}

export interface HistoryItem {
  id: string;
  lastVisitTime: Date;
  title: string;
  typedCount: number;
  url: string;
  visitCount: number;
}

export interface ListItems {
  title: string;
  url: string;
  showUrl?: boolean;
}

export interface StorageResult {
  storedHistory?: HistoryItem[];
}

export interface TabItemType {
  id: string;
  url: string;
  title: string;
  active: boolean;
}

export interface TabsResponse {
  tabs: TabItemType[];
}
