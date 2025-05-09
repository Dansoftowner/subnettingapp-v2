import { IPv4Address } from './ipv4-address';
import { IPv4Mask } from './ipv4-mask';
import { IPv4Subnet } from './ipv4-subnet';

/**
 * Partitions a base network into subnets based on required host counts.
 */
export class IPv4SubnetPartitioner {
  private readonly baseNetworkInt: number;
  private readonly baseMask: IPv4Mask;
  private readonly hostCounts: number[];

  constructor(base: IPv4Address, hostCounts: number[]) {
    const baseSubnet = new IPv4Subnet(base);
    this.baseNetworkInt = baseSubnet.networkAddress.intValue;
    this.baseMask = base.mask;
    this.hostCounts = hostCounts;

    // Validate total capacity
    const totalCapacity = 1 << (32 - this.baseMask.bitCount);
    const requiredTotal = this.hostCounts
      .map((c) => IPv4SubnetPartitioner.blockSizeFor(c))
      .reduce((sum, sz) => sum + sz, 0);
    if (requiredTotal > totalCapacity) {
      throw new Error(
        `Insufficient capacity: required ${requiredTotal} addresses, but only ${totalCapacity} available in ${base.toString()}.`,
      );
    }
  }

  /**
   * Calculates the full block size (including network and broadcast) needed for a given host count.
   */
  private static blockSizeFor(hostCount: number): number {
    const needed = hostCount + 2;
    const e = Math.ceil(Math.log2(needed));
    return 1 << e;
  }

  /**
   * Computes the smallest mask bits to satisfy (hosts + 2).
   */
  private static maskForHostCount(hostCount: number): IPv4Mask {
    const needed = hostCount + 2;
    const e = Math.ceil(Math.log2(needed));
    const bits = 32 - e;
    return new IPv4Mask(bits);
  }

  /**
   * Returns an array of IPv4Subnet instances partitioned in descending order of hostCounts.
   */
  get subnets(): IPv4Subnet[] {
    const sorted = [...this.hostCounts].sort((a, b) => b - a);
    let cursor = this.baseNetworkInt;

    return sorted.map((count) => {
      const mask = IPv4SubnetPartitioner.maskForHostCount(count);
      const subnet = new IPv4Subnet(new IPv4Address(cursor, mask));
      cursor = (subnet.broadcastAddress.intValue + 1) >>> 0;
      return subnet;
    });
  }
}
