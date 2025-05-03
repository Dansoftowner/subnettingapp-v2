export interface SubnetEntry {
  subnetAddress: string;
  firstHostAddress: string;
  lastHostAddress: string;
  broadcastAddress: string;
  subnetMask: string;
  subnetMaskBitCount: number;
  hosts: number;
  hostsUsed: number;
}
