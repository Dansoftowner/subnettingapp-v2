import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, NavigationExtras } from '@angular/router';
import { of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  skip,
  switchMap,
  catchError,
} from 'rxjs/operators';
import { IPv4Validators } from './ipv4-validators';
import { SettingsService } from 'src/app/services/settings.service';
import { Ipv4TaskService } from 'src/app/services/ipv4-task.service';
import { HistoryService } from 'src/app/services/history.service';
import { HistoryItem } from 'src/app/models/history-item.model';
import { ResultInfo } from 'src/app/models/ResultInfo.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
})
export class FormComponent implements OnInit {
  form: FormGroup;
  serverError: string | null = null;
  private historyItemId?: string;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private translate: TranslateService,
    private settingsService: SettingsService,
    private ipv4Service: Ipv4TaskService,
    private historyService: HistoryService
  ) {
    this.form = this.fb.group(
      {
        title: [''],
        ip: ['', [Validators.required, IPv4Validators.ipv4Address]],
        mask: ['', [Validators.required, IPv4Validators.ipv4Mask]],
        task: ['si', Validators.required],
        hostCounts: [''],
        count: ['', [Validators.pattern(/^[0-9]+$/)]],
      },
      { validators: this.formLevelValidator() }
    );

    this.initAutoSaveMechanism();
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

  private initAutoSaveMechanism() {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras.state as { historyItem?: HistoryItem };
    if (state?.historyItem) {
      const hi = state.historyItem;
      this.historyItemId = hi._id;
      this.form.patchValue(
        {
          title: hi.title,
          ip: hi.networkAddress,
          mask: hi.networkMask ? `/${hi.networkMask}` : '',
          task: hi.type,
          hostCounts: hi.hostsCounts?.join(',') || '',
          count: hi.count,
        },
        { emitEvent: false }
      );
    }

    // Auto-save on field changes (debounced)
    if (this.historyItemId) {
      // Title
      this.form
        .get('title')!
        .valueChanges.pipe(
          skip(1),
          debounceTime(500),
          distinctUntilChanged(),
          filter(() => this.form.get('title')!.valid),
          switchMap((val) =>
            this.historyService
              .patchHistoryItem(this.historyItemId!, { title: val })
              .pipe(
                catchError((err) => {
                  this.serverError = err.error?.message || 'Server error';
                  return of(null);
                })
              )
          )
        )
        .subscribe();

      // IP Address
      this.form
        .get('ip')!
        .valueChanges.pipe(
          skip(1),
          debounceTime(500),
          distinctUntilChanged(),
          filter(() => this.form.get('ip')!.valid),
          switchMap((val) =>
            this.historyService
              .patchHistoryItem(this.historyItemId!, { networkAddress: val })
              .pipe(
                catchError((err) => {
                  this.serverError = err.error?.message || 'Server error';
                  return of(null);
                })
              )
          )
        )
        .subscribe();

      // Mask
      this.form
        .get('mask')!
        .valueChanges.pipe(
          skip(1),
          debounceTime(500),
          distinctUntilChanged(),
          filter(() => this.form.get('mask')!.valid),
          switchMap((val) => {
            const bits = IPv4Validators.maskToBitCount(val) || 0;
            return this.historyService
              .patchHistoryItem(this.historyItemId!, { networkMask: bits })
              .pipe(
                catchError((err) => {
                  this.serverError = err.error?.message || 'Server error';
                  return of(null);
                })
              );
          })
        )
        .subscribe();

      // Task
      this.form
        .get('task')!
        .valueChanges.pipe(
          skip(1),
          debounceTime(500),
          distinctUntilChanged(),
          switchMap((val) =>
            this.historyService
              .patchHistoryItem(this.historyItemId!, { type: val })
              .pipe(
                catchError((err) => {
                  this.serverError = err.error?.message || 'Server error';
                  return of(null);
                })
              )
          )
        )
        .subscribe();

      // Hosts Counts
      this.form
        .get('hostCounts')!
        .valueChanges.pipe(
          skip(1),
          debounceTime(500),
          distinctUntilChanged(),
          filter(() => this.form.get('hostCounts')!.valid),
          switchMap((val) => {
            const arr = val.split(',').map((s: string) => +s.trim());
            return this.historyService
              .patchHistoryItem(this.historyItemId!, { hostsCounts: arr })
              .pipe(
                catchError((err) => {
                  this.serverError =
                    err.error?.message ||
                    this.translate.instant('error.server');
                  return of(null);
                })
              );
          })
        )
        .subscribe();

      // Count
      this.form
        .get('count')!
        .valueChanges.pipe(
          skip(1),
          debounceTime(500),
          distinctUntilChanged(),
          filter(() => this.form.get('count')!.valid && this.form.valid),
          switchMap((val) =>
            this.historyService
              .patchHistoryItem(this.historyItemId!, { count: +val })
              .pipe(
                catchError((err) => {
                  this.serverError =
                    err.error?.message ||
                    this.translate.instant('error.server');
                  return of(null);
                })
              )
          )
        )
        .subscribe();
    }
  }

  get spMaxCapacity(): number {
    const maskStr = this.form.get('mask')!.value;
    const bits = IPv4Validators.maskToBitCount(maskStr) || 0;
    const hostBits = 32 - bits;
    return Math.pow(2, hostBits) - 2;
  }

  get rpMaxCount(): number {
    const maskStr = this.form.get('mask')!.value;
    const bits = IPv4Validators.maskToBitCount(maskStr) || 0;
    const hostBits = 32 - bits;
    return Math.pow(2, hostBits - 1);
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

    request.subscribe({
      next: (result: ResultInfo) =>
        this.router.navigate(['/results'], { state: { resultInfo: result } }),
      error: (err) => (this.serverError = err.error?.message || 'error.server'),
    });
  }
}
