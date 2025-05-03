import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SubnetValidators as IPv4Validators } from './ipv4-validators';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
})
export class FormComponent implements OnInit {
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      ip: ['', [Validators.required, IPv4Validators.ipv4Address]],
      mask: ['', [Validators.required, IPv4Validators.ipv4Mask]],
      task: ['si', Validators.required],
      hostCounts: [''],
    });
  }

  ngOnInit(): void {
    // toggle hostsCount field
    this.form.get('task')!.valueChanges.subscribe((value) => {
      const hosts = this.form.get('hostCounts')!;
      if (value === 'sp') {
        hosts.setValidators([IPv4Validators.hostsList]);
        hosts.enable();
      } else {
        hosts.clearValidators();
        hosts.disable();
        hosts.reset();
      }
      hosts.updateValueAndValidity();
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

    // initialize hostsCount disabled
    if (this.form.get('task')!.value !== 'sp') {
      this.form.get('hostCounts')!.disable();
    }
  }

  get autoMaskEnabled(): boolean {
    return true; //this.cookieService.get('auto_mask') !== 'false';
  }

  get autoMaskFormatDDN(): boolean {
    return false; //this.cookieService.get('auto_mask_format') === 'ddn';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // proceed with valid data
    console.log(this.form.value);
  }
}
