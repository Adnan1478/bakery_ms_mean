import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  product: any;
  quantity: number;
  weight?: string;
  addedAt?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = new BehaviorSubject<CartItem[]>(this.getCartFromStorage());
  cartItems$ = this.cartItems.asObservable();

  constructor() { }

  private getCartFromStorage(): CartItem[] {
    if (typeof localStorage !== 'undefined') {
      const cart = localStorage.getItem('cart');
      return cart ? JSON.parse(cart) : [];
    }
    return [];
  }

  addToCart(product: any) {
    const currentCart = this.cartItems.value;
    const weight = product.weight || product.defaultWeight || '0.5 Kg'; // Handle weight from product or selection

    // Find item with same ID AND same weight
    const existingItem = currentCart.find(item =>
      item.product._id === product._id &&
      (item.weight === weight) // Basic string comparison
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      // Clone product to avoid reference issues if we mutate it later
      currentCart.push({
        product: { ...product },
        quantity: 1,
        weight: weight,
        addedAt: Date.now()
      });
    }

    this.updateCart(currentCart);
  }

  removeFromCart(productId: string) {
    const currentCart = this.cartItems.value.filter(item => item.product._id !== productId);
    this.updateCart(currentCart);
  }

  updateQuantity(productId: string, quantity: number) {
    const currentCart = this.cartItems.value;
    const item = currentCart.find(i => i.product._id === productId);
    if (item) {
      item.quantity = quantity;
      if (item.quantity <= 0) {
        this.removeFromCart(productId);
        return;
      }
    }
    this.updateCart(currentCart);
  }

  clearCart() {
    this.updateCart([]);
  }

  private updateCart(cart: CartItem[]) {
    this.cartItems.next(cart);
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  get totalCount() {
    return this.cartItems.value.reduce((acc, item) => acc + item.quantity, 0);
  }

  get totalPrice() {
    return this.cartItems.value.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  }
}
