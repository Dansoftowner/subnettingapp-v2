import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { IPv4Validators } from './ipv4-validators';
import { Router } from '@angular/router';
import { ResultInfo } from '../../models/ResultInfo.model';
import { SubnetEntry } from '../../models/SubnetEntry.model';
import { SettingsService } from 'src/app/services/settings.service';
import { Ipv4TaskService } from 'src/app/services/ipv4-task.service';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
})
export class FormComponent implements OnInit {
  form: FormGroup;
  serverError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private settingsService: SettingsService,
    private ipv4Service: Ipv4TaskService
  ) {
    this.form = this.fb.group(
      {
        ip: ['', [Validators.required, IPv4Validators.ipv4Address]],
        mask: ['', [Validators.required, IPv4Validators.ipv4Mask]],
        task: ['si', Validators.required],
        hostCounts: [''],
        count: ['', [Validators.pattern(/^[0-9]+$/)]],
      },
      { validators: this.formLevelValidator() }
    );
  }

  ngOnInit(): void {
    // toggle hostsCounts and count fields
    this.form.get('task')!.valueChanges.subscribe((value) => {
      const hosts = this.form.get('hostCounts')!;
      const count = this.form.get('count')!;
      if (value === 'sp') {
        hosts.setValidators([Validators.required, IPv4Validators.hostsList]);
        hosts.enable();
        count.clearValidators();
        count.disable();
        count.reset();
      } else if (value === 'rp') {
        count.setValidators([
          Validators.required,
          Validators.pattern(/^[0-9]+$/),
        ]);
        count.enable();
        hosts.clearValidators();
        hosts.disable();
        hosts.reset();
      } else {
        hosts.clearValidators();
        hosts.disable();
        hosts.reset();
        count.clearValidators();
        count.disable();
        count.reset();
      }
      hosts.updateValueAndValidity();
      count.updateValueAndValidity();
    });

    // auto-mask on valid IP
    this.form.get('ip')!.valueChanges.subscribe((ip) => {
      const ipCtrl = this.form.get('ip')!;
      if (ipCtrl.valid && this.autoMaskEnabled) {
        const bits = IPv4Validators.calculateAutoMask(ip);
        const formatted = IPv4Validators.formatMask(
          bits,
          !this.autoMaskFormatDDN
        );
        this.form.get('mask')!.setValue(formatted, { emitEvent: false });
      }
    });

    // initialize hostsCount and count disabled
    this.form.get('hostCounts')!.disable();
    this.form.get('count')!.disable();
  }

  get autoMaskEnabled(): boolean {
    let enabled = false;
    this.settingsService
      .getAutoMaskEnabled()
      .subscribe((val) => (enabled = val));
    return enabled;
  }

  get autoMaskFormatDDN(): boolean {
    let formatDDN = false;
    this.settingsService
      .getCurrentMaskFormat()
      .subscribe((val) => (formatDDN = val === 'ddn'));
    return formatDDN;
  }

  formLevelValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const task = group.get('task')!.value;
      const maskStr = group.get('mask')!.value;
      const maskBits = IPv4Validators.maskToBitCount(maskStr) || 0;
      const hostBits = 32 - maskBits;

      if (task === 'sp') {
        const v = group.get('hostCounts')!.value as string;
        if (v) {
          const counts = v.split(',').map((s) => +s);
          const totalCapacity = Math.pow(2, hostBits);
          const required = counts.reduce(
            (sum, c) => sum + Math.pow(2, Math.ceil(Math.log2(c + 2))),
            0
          );
          if (required > totalCapacity) {
            return { hostsCapacity: true };
          }
        }
      }

      if (task === 'rp') {
        const val = group.get('count')!.value;
        if (group.get('count')!.errors?.['pattern']) {
          return { countNumeric: true };
        }
        const countVal = +val;
        if (!isNaN(countVal) && countVal > 0) {
          const maxCount = Math.pow(2, hostBits - 1);
          if ((countVal & (countVal - 1)) !== 0) {
            return { countNotPowerOfTwo: true };
          }
          if (countVal > maxCount) {
            return { countExceedsMax: true };
          }
        }
      }

      return null;
    };
  }

  onSubmit(): void {
    this.serverError = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const ip = this.form.get('ip')!.value;
    const maskStr = this.form.get('mask')!.value;
    const maskBits = IPv4Validators.maskToBitCount(maskStr)!;
    const task = this.form.get('task')!.value;

    let request;
    if (task === 'si') {
      request = this.ipv4Service.getNetworkInfo(ip, maskBits);
    } else if (task === 'sp') {
      const hostsCounts = this.form
        .get('hostCounts')!
        .value.split(',')
        .map((s: string) => +s);
      request = this.ipv4Service.partitionSubnet(ip, maskBits, hostsCounts);
    } else {
      const count = +this.form.get('count')!.value;
      request = this.ipv4Service.regularPartition(ip, maskBits, count);
    }

    request.subscribe(
      (result: ResultInfo) =>
        this.router.navigate(['/results'], { state: { resultInfo: result } }),
      (err) => (this.serverError = err.error?.message || 'error.server')
    );
  }
}
