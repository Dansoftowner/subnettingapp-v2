import { TaskType } from './task-type.model';

export interface HistoryItem {
  _id?: string;
  userId?: string;
  title?: string;
  type?: TaskType;
  networkAddress?: string;
  networkMask?: number;
  hostsCounts?: number[];
  count?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
