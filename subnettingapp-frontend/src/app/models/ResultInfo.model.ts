import { SubnetEntry } from 'src/app/models/SubnetEntry.model';
import { TaskType } from 'src/app/models/TaskType.model';

export interface ResultInfo {
  networkAddress: string;
  networkMask: string;
  type: TaskType;
  hostsCounts: number[];
  entries: SubnetEntry[];
}
