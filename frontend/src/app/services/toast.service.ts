import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toasts.asObservable();
  private counter = 0;

  constructor() { }

  show(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const id = this.counter++;
    const newToast: Toast = { message, type, id };
    this.toasts.next([...this.toasts.value, newToast]);

    setTimeout(() => {
      this.remove(id);
    }, 3000); // Auto dismiss after 3 seconds
  }

  remove(id: number) {
    const currentToasts = this.toasts.value.filter(t => t.id !== id);
    this.toasts.next(currentToasts);
  }
}
