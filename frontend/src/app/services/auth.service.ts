import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';
  private userSubject = new BehaviorSubject<any>(this.getUserFromStorage());
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) { }

  private getUserFromStorage() {
    if (typeof localStorage !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem('user', JSON.stringify(response));
          this.userSubject.next(response);
        }
      })
    );
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem('user', JSON.stringify(response));
          this.userSubject.next(response);
        }
      })
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword({ email, otp, newPassword }: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { email, otp, newPassword });
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`).pipe(
      tap((user: any) => {
        const currentUser = this.userSubject.value;
        const newUserData = { ...currentUser, ...user };
        localStorage.setItem('user', JSON.stringify(newUserData));
        this.userSubject.next(newUserData);
      })
    );
  }

  updateProfile(formData: FormData): Observable<any> {
    // apiUrl is .../api/auth, so we need to go up one level or hardcode for now or change base url strategy
    // simpler to just replace auth with users since we know the structure
    const usersUrl = this.apiUrl.replace('/auth', '/users');
    return this.http.put<any>(`${usersUrl}/profile`, formData).pipe(
      tap(updatedUser => {
        const currentUser = this.userSubject.value;
        const newUserData = { ...currentUser, ...updatedUser };

        // Update local storage
        localStorage.setItem('user', JSON.stringify(newUserData));
        this.userSubject.next(newUserData);
      })
    );
  }

  logout() {
    localStorage.removeItem('user');
    this.userSubject.next(null);
  }

  getToken(): string | null {
    const user = this.userSubject.value;
    return user ? user.token : null;
  }

  get currentUserValue() {
    return this.userSubject.value;
  }
}
