import { AbstractControl, ValidationErrors } from '@angular/forms';

export class IPv4Validators {
  private static ipRegex = /^\d+\.\d+\.\d+\.\d+$/;
  private static cdirRegex = /^\/\d+$/;
  private static listRegex = /^(\d+)(,\s*\d+)*$/;
  private static classMask = { A: 8, B: 16, C: 24 };

  static ipv4Address(control: AbstractControl): ValidationErrors | null {
    const v: string = control.value;

    if (!IPv4Validators.ipRegex.test(v)) return { ip: true };
    const parts = v.split('.').map((n) => +n);

    return parts.every((n) => n >= 0 && n <= 255) ? null : { ip: true };
  }

  static ipv4Mask(control: AbstractControl): ValidationErrors | null {
    const v: string = control.value;

    // validate mask formatted in '/x'
    if (IPv4Validators.cdirRegex.test(v)) {
      const num = +v.slice(1);
      return num > 0 && num < 33 ? null : { mask: true };
    }

    // validate mask formatted in 'x.x.x.x'
    if (IPv4Validators.ipRegex.test(v)) {
      const parts = v.split('.').map((n) => +n);
      // each octet 0-255 and non-increasing
      for (let i = 0; i < parts.length; i++) {
        if (parts[i] < 0 || parts[i] > 255) return { mask: true };
        if (i > 0 && parts[i] > parts[i - 1]) return { mask: true };
      }

      // mask must be continous in bits!
      const maskInt =
        ((parts[0] << 24) >>> 0) |
        ((parts[1] << 16) >>> 0) |
        ((parts[2] << 8) >>> 0) |
        (parts[3] >>> 0);
      const inv = ~maskInt >>> 0;

      // valid mask => inv+1 is power of two
      if ((inv & (inv + 1)) !== 0) return { mask: true };
      return null;
    }

    return { mask: true };
  }

  static hostsList(control: AbstractControl): ValidationErrors | null {
    const v: string = control.value;
    return IPv4Validators.listRegex.test(v) ? null : { hostsList: true };
  }

  static calculateAutoMask(ipAddress: string): number {
    let ipClass = IPv4Validators.getClassForIp(ipAddress);
    let maskCalc = IPv4Validators.classMask[ipClass as 'A' | 'B' | 'C'];
    return maskCalc || 0;
  }

  static getClassForIp(ipAddress: string): string {
    let firstOctet = Number.parseInt(
      ipAddress.substring(0, ipAddress.indexOf('.'))
    );
    return firstOctet < 128
      ? 'A'
      : firstOctet < 192
      ? 'B'
      : firstOctet < 224
      ? 'C'
      : firstOctet < 240
      ? 'D'
      : firstOctet < 255
      ? 'E'
      : '-';
  }

  static formatMask(maskBits: number, cdir: boolean): string {
    if (maskBits == 0) return '';
    if (cdir) {
      return `/${maskBits}`;
    } else {
      let formatted = '';
      let bitCount = maskBits;

      for (let i = 0; i < 4; i++) {
        let octet = 0;

        for (let j = 7; j >= 0; j--) {
          if (bitCount == 0) break;
          octet |= 1 << j;
          bitCount -= 1;
        }

        formatted += `${octet}.`;
      }

      return formatted.substring(0, formatted.length - 1);
    }
  }

  static maskToBitCount(mask: string): number | undefined {
    if (IPv4Validators.cdirRegex.test(mask)) {
      return +mask.slice(1);
    } else {
      let bitCount = 0;
      const parts = mask.split('.').map((n) => +n);
      for (let i = 1; i < parts.length; i++) {
        // the mask should be continous
        if (parts[i] > parts[i - 1]) return undefined;
        bitCount += IPv4Validators.bitCount(parts[i - 1]);
      }
      bitCount += IPv4Validators.bitCount(parts[parts.length - 1]);
      return bitCount;
    }
  }

  static bitCount(num: number): number {
    let count = 0;
    while (num > 0) {
      count += num & 1;
      num >>= 1;
    }
    return count;
  }
}
