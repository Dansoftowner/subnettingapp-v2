export interface HistoryItem {
  _id?: string;
  userId?: string;
  title?: string;
  type?: 'si' | 'sp' | 'rp';
  networkAddress?: string;
  networkMask?: number;
  hostsCounts?: number[];
  count?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
