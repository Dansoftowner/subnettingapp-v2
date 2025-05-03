import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SubnetValidators as IPv4Validators } from './ipv4-validators';
import { Router } from '@angular/router';
import { Entry } from '../results/results.component';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
})
export class FormComponent implements OnInit {
  form: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
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

    const entries: Entry[] = [
      {
        subnetAddress: '192.168.1.0',
        firstHostAddress: '192.168.1.1',
        lastHostAddress: '192.168.1.254',
        broadcastAddress: '192.168.1.255',
        subnetMask: '255.255.255.0',
        hosts: 200,
        hostsUsed: 120,
      },
      {
        subnetAddress: '10.0.0.0',
        firstHostAddress: '10.0.0.1',
        lastHostAddress: '10.0.0.14',
        broadcastAddress: '10.0.0.15',
        subnetMask: '255.255.255.240',
        hosts: 30,
        hostsUsed: 11,
      },
      {
        subnetAddress: '172.16.0.0',
        firstHostAddress: '172.16.0.1',
        lastHostAddress: '172.16.0.126',
        broadcastAddress: '172.16.0.127',
        subnetMask: '255.255.255.128',
        hosts: 40,
        hostsUsed: 38,
      },
    ];

    this.router.navigate(['/results'], { state: { entries } });

    // proceed with valid data
    console.log(this.form.value);
  }
}
