import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  user$;
  cartCount$;

  constructor(
    public authService: AuthService,
    public cartService: CartService,
    private router: Router
  ) {
    this.user$ = this.authService.user$;
    this.cartCount$ = this.cartService.cartItems$;
  }

  logout() {
    this.authService.logout();
    this.cartService.clearCart();
    this.router.navigate(['/login']);
  }

  get totalCartItems() {
    return this.cartService.totalCount;
  }
}
