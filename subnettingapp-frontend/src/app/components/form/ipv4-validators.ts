import { AbstractControl, ValidationErrors } from '@angular/forms';

export class SubnetValidators {
  private static ipRegex = /^\d+\.\d+\.\d+\.\d+$/;
  private static cdirRegex = /^\/\d+$/;
  private static listRegex = /^(\d+)(,\s*\d+)*$/;
  private static classMask = { A: 8, B: 16, C: 24 };

  static ipv4Address(control: AbstractControl): ValidationErrors | null {
    const v: string = control.value;

    if (!SubnetValidators.ipRegex.test(v)) return { ip: true };
    const parts = v.split('.').map((n) => +n);

    return parts.every((n) => n >= 0 && n <= 255) ? null : { ip: true };
  }

  static ipv4Mask(control: AbstractControl): ValidationErrors | null {
    const v: string = control.value;

    // validate mask formatted in 'x.x.x.x'
    if (SubnetValidators.ipRegex.test(v)) {
      const parts = v.split('.').map((n) => +n);
      for (let i = 1; i < parts.length; i++) {
        // the mask should be continous
        if (parts[i] > parts[i - 1]) return { mask: true };
      }
      return null;
    }

    // validate mask formatted in '/x'
    if (SubnetValidators.cdirRegex.test(v)) {
      const num = +v.slice(1);
      return num > 0 && num < 33 ? null : { mask: true };
    }

    return { mask: true };
  }

  static hostsList(control: AbstractControl): ValidationErrors | null {
    const v: string = control.value;
    return SubnetValidators.listRegex.test(v) ? null : { hostsList: true };
  }

  static calculateAutoMask(ipAddress: string) {
    let ipClass = SubnetValidators.getClassForIp(ipAddress);
    let maskCalc = SubnetValidators.classMask[ipClass as 'A' | 'B' | 'C'];
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
}
