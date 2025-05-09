import { IPv4Mask } from './ipv4-mask';
import { IPV4_ADDRESS_REGEX } from './patterns';

export class IPv4Address {
  readonly intValue: number;
  readonly mask: IPv4Mask;

  constructor(intValue: number, mask: IPv4Mask) {
    this.intValue = intValue >>> 0;
    this.mask = mask;
  }

  /**
   * Parses a string like "192.168.1.5/24" or "192.168.1.5" (no mask) into an IPv4Address.
   */
  static parse(input: string): IPv4Address {
    let [ipPart, cidrPart] = input.split('/');
    if (!IPV4_ADDRESS_REGEX.test(ipPart)) {
      throw new Error(`Invalid IPv4 address: ${ipPart}`);
    }
    const octets = ipPart.split('.').map((o) => Number(o));
    if (octets.some((o) => o < 0 || o > 255)) {
      throw new Error(`IPv4 octet out of range in: ${ipPart}`);
    }
    const intValue = octets.reduce((acc, o) => (acc << 8) | o, 0) >>> 0;

    const mask =
      cidrPart !== undefined
        ? new IPv4Mask(Number(cidrPart))
        : new IPv4Mask(24); // default mask if none provided

    return new IPv4Address(intValue, mask);
  }

  /**
   * Returns the IP address in dotted-decimal notation (e.g., "192.168.1.5").
   */
  toIpString(): string {
    return [24, 16, 8, 0]
      .map((shift) => ((this.intValue >>> shift) & 0xff).toString())
      .join('.');
  }

  /**
   * Default toString outputs "x.x.x.x/y".
   */
  toString(): string {
    return `${this.toIpString()}${this.mask.toCidrString()}`;
  }
}
