import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  products: any[] = [];
  categories: any[] = [];
  loading = false;

  searchTerm = '';
  selectedCategory = '';

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private cartService: CartService,
    private toast: ToastService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe(data => this.categories = data);
  }

  loadProducts() {
    this.loading = true;
    this.productService.getProducts(this.searchTerm, this.selectedCategory).subscribe({
      next: (data) => {
        this.products = data.filter((p: any) => p.stock > 0);
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  onFilterChange() {
    this.loadProducts();
  }

  addToCart(product: any) {
    if (!this.authService.currentUserValue) {
      this.toast.show('Please login to add items to cart', 'error');
      this.router.navigate(['/login']);
      return;
    }
    this.cartService.addToCart(product);
    this.toast.show(`${product.name} added to cart!`, 'success');
  }
}
