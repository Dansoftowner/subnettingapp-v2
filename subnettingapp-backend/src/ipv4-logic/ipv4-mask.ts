import { ApiError } from '../error/api-error';

export class IPv4Mask {
  readonly bitCount: number;

  constructor(bitCount: number) {
    if (bitCount < 1 || bitCount >= 32) {
      throw new ApiError(
        400,
        `Invalid mask length: /${bitCount}. Must be between 1 and 31.`,
      );
    }
    this.bitCount = bitCount;
  }

  /**
   * Returns the mask as a 32-bit unsigned integer (e.g., /24 -> 0xFFFFFF00).
   */
  get asInt(): number {
    // (>>> 0) is needed to convert it to unsigned
    return (0xffffffff << (32 - this.bitCount)) >>> 0;
  }

  /**
   * Returns the mask in CIDR notation (e.g., "/24").
   */
  toCidrString(): string {
    return `/${this.bitCount}`;
  }

  /**
   * Returns the mask in dotted-decimal notation (e.g., "255.255.255.0").
   */
  toDotDecimalString(): string {
    const m = this.asInt;
    return [24, 16, 8, 0]
      .map((shift) => ((m >>> shift) & 0xff).toString())
      .join('.');
  }
}
