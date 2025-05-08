import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PasswordRestorationService } from '../../services/password-restoration.service';

@Component({
  selector: 'app-password-restoration',
  templateUrl: './password-restoration.component.html',
  styleUrls: ['./password-restoration.component.css'],
})
export class PasswordRestorationComponent implements OnInit {
  emailForm: FormGroup;
  passwordForm: FormGroup;
  isResetMode = false;
  loading = false;
  successMessage = '';
  errorMessage = '';

  private userId: string | null = null;
  private token: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    private restorationService: PasswordRestorationService
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('userId');
    this.token = this.route.snapshot.paramMap.get('passwordtoken');
    this.isResetMode = !!(this.userId && this.token);
  }

  submitEmail(): void {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.errorMessage = '';

    this.restorationService.requestReset(this.emailForm.value.email).subscribe(
      () => {
        this.successMessage = this.translate.instant(
          'forgottenPassword.successRequest'
        );
        this.loading = false;
      },
      (err) => {
        this.errorMessage =
          err.error?.message || this.translate.instant('error.generic');
        this.loading = false;
      }
    );
  }

  submitPassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    const { password, confirmPassword } = this.passwordForm.value;
    if (password !== confirmPassword) {
      this.errorMessage = this.translate.instant('error.passwordMismatch');
      return;
    }
    this.loading = true;
    this.errorMessage = '';

    if (this.userId && this.token) {
      this.restorationService
        .resetPassword(this.userId, this.token, password)
        .subscribe(
          () => {
            this.successMessage = this.translate.instant(
              'forgottenPassword.successReset'
            );
            this.loading = false;
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          },
          (err) => {
            this.errorMessage =
              err.error?.message || this.translate.instant('error.generic');
            this.loading = false;
          }
        );
    }
  }
}
