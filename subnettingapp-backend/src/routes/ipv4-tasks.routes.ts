import express, { Request, Response, Router } from 'express';
import { IPv4Address } from '../ipv4-logic/ipv4-address';
import { IPv4Subnet } from '../ipv4-logic/ipv4-subnet';
import { IPv4SubnetPartitioner } from '../ipv4-logic/ipv4-subnet-partitioner';
import { IPv4EqualSubnetSplitter } from '../ipv4-logic/ipv4-equal-subnet-splitter';

interface SubnetEntry {
  subnetAddress: string;
  firstHostAddress: string;
  lastHostAddress: string;
  broadcastAddress: string;
  subnetMask: string;
  subnetMaskBitCount: number;
  hosts: number;
  hostsUsed: number;
}

interface ResultInfo {
  networkAddress: string;
  networkMask: string;
  type: 'si' | 'sp' | 'rp';
  hostsCounts: number[];
  entries: SubnetEntry[];
}

const router: Router = express.Router();

router.post('/ipv4-task/si', (req: Request, res: Response) => {
  const { networkAddress, networkMask } = req.body as {
    networkAddress: string;
    networkMask: number;
  };

  const base = IPv4Address.parse(`${networkAddress}/${networkMask}`);
  const subnet = new IPv4Subnet(base);
  const mask = base.mask;

  const entry: SubnetEntry = {
    subnetAddress: subnet.networkAddress.toIpString(),
    firstHostAddress: subnet.firstHostAddress.toIpString(),
    lastHostAddress: subnet.lastHostAddress.toIpString(),
    broadcastAddress: subnet.broadcastAddress.toIpString(),
    subnetMask: mask.toDotDecimalString(),
    subnetMaskBitCount: mask.bitCount,
    hosts: (1 << (32 - mask.bitCount)) - 2,
    hostsUsed: 0,
  };

  const result: ResultInfo = {
    networkAddress,
    networkMask: mask.toCidrString(),
    type: 'si',
    hostsCounts: [],
    entries: [entry],
  };

  res.json(result);
});

router.post('/ipv4-task/sp', (req: Request, res: Response) => {
  const { networkAddress, networkMask, hostsCounts } = req.body as {
    networkAddress: string;
    networkMask: number;
    hostsCounts: number[];
  };

  const hostsCountsSorted = hostsCounts.sort((a, b) => b - a);

  const base = IPv4Address.parse(`${networkAddress}/${networkMask}`);
  const partitioner = new IPv4SubnetPartitioner(base, hostsCounts);
  const subnets = partitioner.subnets;

  const entries: SubnetEntry[] = subnets.map((sub, idx) => {
    const mask = sub.networkAddress.mask;
    const hostBits = 32 - mask.bitCount;
    const capacity = (1 << hostBits) - 2;
    return {
      subnetAddress: sub.networkAddress.toIpString(),
      firstHostAddress: sub.firstHostAddress.toIpString(),
      lastHostAddress: sub.lastHostAddress.toIpString(),
      broadcastAddress: sub.broadcastAddress.toIpString(),
      subnetMask: mask.toDotDecimalString(),
      subnetMaskBitCount: mask.bitCount,
      hosts: capacity,
      hostsUsed: hostsCountsSorted[idx],
    };
  });

  const result: ResultInfo = {
    networkAddress,
    networkMask: `/${networkMask}`,
    type: 'sp',
    hostsCounts,
    entries,
  };

  res.json(result);
});

router.post('/ipv4-task/rp', (req: Request, res: Response) => {
  const { networkAddress, networkMask, count } = req.body as {
    networkAddress: string;
    networkMask: number;
    count: number;
  };

  const base = IPv4Address.parse(`${networkAddress}/${networkMask}`);
  const splitter = new IPv4EqualSubnetSplitter(base, count);
  const subnets = splitter.subnets;

  const mask = subnets[0].networkAddress.mask;
  const hostBits = 32 - mask.bitCount;
  const capacity = (1 << hostBits) - 2;

  const entries: SubnetEntry[] = subnets.map((sub) => ({
    subnetAddress: sub.networkAddress.toIpString(),
    firstHostAddress: sub.firstHostAddress.toIpString(),
    lastHostAddress: sub.lastHostAddress.toIpString(),
    broadcastAddress: sub.broadcastAddress.toIpString(),
    subnetMask: mask.toDotDecimalString(),
    subnetMaskBitCount: mask.bitCount,
    hosts: capacity,
    hostsUsed: 0,
  }));

  const result: ResultInfo = {
    networkAddress,
    networkMask: mask.toCidrString(),
    type: 'rp',
    hostsCounts: Array(count).fill(capacity),
    entries,
  };

  res.json(result);
});

export default router;
