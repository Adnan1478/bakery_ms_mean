import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  loading = false;
  submitted = false;
  step = 1; // 1: Email, 2: OTP & New Password
  userEmail: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toast: ToastService,
    private router: Router
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      otp: [''],
      newPassword: ['']
    });
  }

  get f() { return this.forgotForm.controls; }

  onSubmit() {
    this.submitted = true;

    if (this.step === 1) {
      // Step 1: Send OTP
      if (this.f['email'].invalid) return;

      this.loading = true;
      this.authService.forgotPassword(this.forgotForm.value.email)
        .subscribe({
          next: (res) => {
            this.toast.show(res.message, 'success');
            this.userEmail = this.forgotForm.value.email;
            this.step = 2;

            // Add validators for next step
            this.f['otp'].setValidators([Validators.required]);
            this.f['newPassword'].setValidators([Validators.required, Validators.minLength(6)]);
            this.f['otp'].updateValueAndValidity();
            this.f['newPassword'].updateValueAndValidity();

            this.loading = false;

            // FOR DEMO: Show token in alert/toast or console
            if (res.debug_token) {
              alert(`DEMO: Your OTP is ${res.debug_token}`);
            }
          },
          error: (error) => {
            this.toast.show(error.error.message || 'Error occurred', 'error');
            this.loading = false;
          }
        });
    } else {
      // Step 2: Verify & Reset
      if (this.forgotForm.invalid) return;

      this.loading = true;
      const data = {
        email: this.userEmail,
        otp: this.forgotForm.value.otp,
        newPassword: this.forgotForm.value.newPassword
      };

      this.authService.resetPassword(data)
        .subscribe({
          next: (res) => {
            this.toast.show(res.message, 'success');
            this.loading = false;
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          },
          error: (error) => {
            this.toast.show(error.error.message || 'Invalid OTP', 'error');
            this.loading = false;
          }
        });
    }
  }
}
