import { ApiError } from '../error/api-error';
import { IPv4Address } from './ipv4-address';
import { IPv4Mask } from './ipv4-mask';
import { IPv4Subnet } from './ipv4-subnet';

/**
 * Splits a base IPv4 network into a specified number of equal-sized subnets.
 * Validates that count is a power of two and does not exceed the maximum (2^(hostBits-1)).
 */
export class IPv4EqualSubnetSplitter {
  private readonly baseNetworkInt: number;
  private readonly baseMask: IPv4Mask;
  private readonly count: number;

  constructor(base: IPv4Address, count: number) {
    if (count <= 0 || (count & (count - 1)) !== 0) {
      throw new ApiError(
        400,
        `Invalid subnet count: ${count}. Count must be a power of two.`,
      );
    }
    this.baseMask = base.mask;
    const hostBits = 32 - this.baseMask.bitCount;
    const maxCount = 1 << (hostBits - 1);
    if (count > maxCount) {
      throw new ApiError(
        400,
        `Cannot split ${base.toString()} into ${count} subnets: maximum is ${maxCount}.`,
      );
    }
    this.count = count;
    const subnet = new IPv4Subnet(base);
    this.baseNetworkInt = subnet.networkAddress.intValue;
  }

  /**
   * Returns an array of equal-sized IPv4Subnets.
   */
  get subnets(): IPv4Subnet[] {
    const prefixIncrement = Math.log2(this.count);
    const newMaskBits = this.baseMask.bitCount + prefixIncrement;
    const mask = new IPv4Mask(newMaskBits);
    const blockSize = 1 << (32 - newMaskBits);

    const subnets: IPv4Subnet[] = [];
    for (let i = 0; i < this.count; i++) {
      const networkInt = (this.baseNetworkInt + i * blockSize) >>> 0;
      const addr = new IPv4Address(networkInt, mask);
      subnets.push(new IPv4Subnet(addr));
    }
    return subnets;
  }
}
