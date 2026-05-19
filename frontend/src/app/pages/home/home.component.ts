import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
    products: any[] = [];
    customerFavorites: any[] = [];
    loading = true;

    constructor(
        private productService: ProductService,
        private cartService: CartService,
        private toast: ToastService
    ) { }

    ngOnInit() {
        this.productService.getProducts().subscribe({
            next: (data) => {
                this.products = data.filter((p: any) => p.stock > 0);
                this.getRandomFavorites();
                this.loading = false;
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
            }
        });
    }

    getRandomFavorites() {
        // Shuffle array
        const shuffled = [...this.products].sort(() => 0.5 - Math.random());
        // Get first 6
        this.customerFavorites = shuffled.slice(0, 6);
    }

    addToCart(product: any) {
        this.cartService.addToCart(product);
        this.toast.show(`${product.name} added to cart!`, 'success');
    }
}
