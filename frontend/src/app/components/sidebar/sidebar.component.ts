import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive], // Add CommonModule for *ngIf
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  constructor(private authService: AuthService, private cartService: CartService, private router: Router) { }

  get isAdmin(): boolean {
    const user = this.authService.currentUserValue;
    return user && user.role === 'admin';
  }

  get userName(): string {
    const user = this.authService.currentUserValue;
    return user ? (user.name || 'User') : '';
  }

  logout() {
    this.authService.logout();
    this.cartService.clearCart();
    this.router.navigate(['/login']);
  }
}
