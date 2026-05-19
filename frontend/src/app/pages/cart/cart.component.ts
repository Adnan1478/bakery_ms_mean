import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './cart.component.html',
    styleUrls: ['./cart.component.css']
})
export class CartComponent {
    cartItems$;
    loading = false;

    constructor(
        private cartService: CartService,
        private orderService: OrderService,
        private authService: AuthService,
        private router: Router,
        private toast: ToastService
    ) {
        this.cartItems$ = this.cartService.cartItems$;
    }

    updateQuantity(id: string, qty: number) {
        this.cartService.updateQuantity(id, qty);
    }

    removeItem(id: string) {
        this.cartService.removeFromCart(id);
        this.toast.show('Item removed from cart', 'info');
    }

    checkout(items: any[]) {
        if (!this.authService.getToken()) {
            this.toast.show('Please login to checkout', 'info');
            this.router.navigate(['/login']);
            return;
        }

        this.router.navigate(['/checkout']);
    }

    getTotal(items: any[]) {
        return items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    }
}
