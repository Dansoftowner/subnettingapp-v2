import { SubnetEntry } from 'src/app/models/subnet-entry.model';
import { TaskType } from 'src/app/models/task-type.model';

export interface ResultInfo {
  networkAddress: string;
  networkMask: string;
  type: TaskType;
  hostsCounts: number[];
  entries: SubnetEntry[];
}
