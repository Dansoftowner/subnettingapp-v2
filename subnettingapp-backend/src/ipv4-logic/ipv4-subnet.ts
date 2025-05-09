import { IPv4Address } from './ipv4-address';

export class IPv4Subnet {
  private readonly address: IPv4Address;

  constructor(address: IPv4Address) {
    this.address = address;
  }

  /** Network (subnet) address = IP & mask */
  get networkAddress(): IPv4Address {
    const netInt = this.address.intValue & this.address.mask.asInt;
    return new IPv4Address(netInt, this.address.mask);
  }

  /** Broadcast address = network | ~mask */
  get broadcastAddress(): IPv4Address {
    const maskInt = this.address.mask.asInt;
    const bcastInt = (this.networkAddress.intValue | (~maskInt >>> 0)) >>> 0;
    return new IPv4Address(bcastInt, this.address.mask);
  }

  /** First usable host = network + 1 */
  get firstHostAddress(): IPv4Address {
    return new IPv4Address(
      (this.networkAddress.intValue + 1) >>> 0,
      this.address.mask,
    );
  }

  /** Last usable host = broadcast - 1 */
  get lastHostAddress(): IPv4Address {
    return new IPv4Address(
      (this.broadcastAddress.intValue - 1) >>> 0,
      this.address.mask,
    );
  }
}
