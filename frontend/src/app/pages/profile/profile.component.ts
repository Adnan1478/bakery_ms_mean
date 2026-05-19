import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
    profileForm: FormGroup;
    currentUser: any;
    selectedFile: File | null = null;
    imagePreview: string | number | null = null;
    isLoading = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private toastService: ToastService
    ) {
        this.profileForm = this.fb.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', Validators.required],
            house: [''],
            area: [''],
            landmark: [''],
            street: [''], // Keeping street for consistency, though detailed fields are preferred
            city: [''],
            state: [''],
            zip: [''],
            country: ['India'], // Default to India as in checkout
            password: ['', [Validators.minLength(6)]],
            confirmPassword: ['']
        });
    }

    ngOnInit(): void {
        // Initial subscription to handle current synchronous state
        this.authService.user$.subscribe(user => {
            this.updateFormWithUser(user);
        });

        // Fetch fresh data from server
        this.authService.getProfile().subscribe({
            next: (user) => {
                this.updateFormWithUser(user);
            },
            error: (err) => {
                console.error('Failed to fetch fresh profile', err);
            }
        });
    }

    private updateFormWithUser(user: any) {
        this.currentUser = user;
        if (user) {
            this.profileForm.patchValue({
                name: user.name,
                email: user.email,
                phone: user.phone || '',
                street: user.address?.street || '',
                city: user.address?.city || '',
                state: user.address?.state || '',
                zip: user.address?.zip || '',
                house: user.address?.house || '',
                area: user.address?.area || '',
                landmark: user.address?.landmark || '',
                country: user.address?.country || 'India'
            }, { emitEvent: false }); // Prevent infinite loops if any

            if (user.image) {
                this.imagePreview = user.image.startsWith('http') ? user.image : `http://localhost:5000/${user.image.replace(/\\/g, '/')}`;
            }
        }
    }

    onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;

            // Preview
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    this.imagePreview = reader.result;
                }
            };
            reader.readAsDataURL(file);
        }
    }

    onSubmit(): void {
        if (this.profileForm.invalid) {
            return;
        }

        const { password, confirmPassword } = this.profileForm.value;
        if (password && password !== confirmPassword) {
            this.toastService.show('Passwords do not match', 'error');
            return;
        }

        this.isLoading = true;
        const formData = new FormData();

        // Append form fields
        Object.keys(this.profileForm.controls).forEach(key => {
            const value = this.profileForm.get(key)?.value;
            if (value && key !== 'confirmPassword') {
                formData.append(key, value);
            }
        });

        if (this.selectedFile) {
            formData.append('image', this.selectedFile);
        }

        this.authService.updateProfile(formData).subscribe({
            next: (res) => {
                this.isLoading = false;
                this.toastService.show('Profile updated successfully!', 'success');
                this.profileForm.get('password')?.reset();
                this.profileForm.get('confirmPassword')?.reset();
            },
            error: (err) => {
                this.isLoading = false;
                this.toastService.show(err.error?.message || 'Update failed', 'error');
            }
        });
    }
}
