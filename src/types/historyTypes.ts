export interface HistoryResposne {
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
