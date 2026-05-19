import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { PaymentService } from '../../services/payment.service';
import { Subscription } from 'rxjs';

declare var Razorpay: any;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit, OnDestroy {
  shippingAddress = {
    name: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'India',
  };

  newAddress = {
    country: 'India',
    name: '',
    mobile: '',
    zip: '',
    house: '',
    area: '',
    landmark: '',
    city: '',
    state: '',
  };

  isEditingAddress = false;

  loading = false;
  total = 0;
  cartItems: CartItem[] = [];
  private cartSubscription: Subscription | undefined;

  get itemsCount(): number {
    return this.cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private toastService: ToastService,
    private paymentService: PaymentService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    // Subscribe to cart items
    this.cartSubscription = this.cartService.cartItems$.subscribe((items) => {
      this.cartItems = items;
      this.total = this.cartService.totalPrice;
    });

    // Try to pre-fill user details
    const user = this.authService.currentUserValue;
    if (user) {
      if (user.name) {
        this.shippingAddress.name = user.name;
        this.newAddress.name = user.name;
      }
      if (user.phone) {
        this.newAddress.mobile = user.phone;
      }
      if (user.address) {
        // Check if detailed address exists
        if (user.address.house || user.address.area) {
          this.newAddress.house = user.address.house || '';
          this.newAddress.area = user.address.area || '';
          this.newAddress.landmark = user.address.landmark || '';
          this.newAddress.city = user.address.city || '';
          this.newAddress.state = user.address.state || '';
          this.newAddress.zip = user.address.zip || '';
          this.newAddress.country = user.address.country || 'India';

          this.shippingAddress.street = `${this.newAddress.house}, ${this.newAddress.area}, ${this.newAddress.landmark}`;
          this.shippingAddress.city = this.newAddress.city;
          this.shippingAddress.state = this.newAddress.state;
          this.shippingAddress.zip = this.newAddress.zip;
          this.shippingAddress.country = this.newAddress.country;
        } else {
          // Fallback to old street field
          this.shippingAddress.street = user.address.street || '';
          this.shippingAddress.city = user.address.city || '';
          this.shippingAddress.zip = user.address.zip || '';

          // Populate edit form as well for convenience
          this.newAddress.house = user.address.street || '';
          this.newAddress.city = user.address.city || '';
          this.newAddress.zip = user.address.zip || '';
        }
      }
    }
  }

  loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  }

  // 🔥 Payment Function
  async payNow() {
    if (this.cartItems.length === 0) {
      this.toastService.show('Cart is empty', 'error');
      return;
    }

    this.loading = true;

    const loaded = await this.loadRazorpayScript();

    if (!loaded) {
      this.toastService.show('Razorpay failed to load', 'error');
      this.loading = false;
      return;
    }

    // 🔥 STEP 1: Create Razorpay order from backend
    this.paymentService.createOrder(this.total).subscribe({
      next: (res: any) => {
        const order = res.order;

        const options: any = {
          key: 'rzp_test_SdgIZlKdZc4CNB', // 🔴 YOUR TEST KEY
          amount: order.amount,
          currency: order.currency,
          name: 'BakeDelight',
          description: 'Order Payment',
          order_id: order.id, // 🔥 IMPORTANT

          handler: (response: any) => {
            console.log('Payment Success:', response);

            // 🔥 STEP 2: VERIFY PAYMENT
            this.paymentService
              .verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              })
              .subscribe({
                next: () => {
                  // 🔥 STEP 3: CREATE YOUR ORDER
                  this.createOrder(response.razorpay_payment_id);
                },

                error: () => {
                  this.toastService.show(
                    'Payment verification failed',
                    'error',
                  );
                  this.loading = false;
                },
              });
          },

          prefill: {
            name: this.shippingAddress.name,
            email: 'test@gmail.com',
            contact: '9999999999',
          },

          theme: {
            color: '#3399cc',
          },

          modal: {
            ondismiss: () => {
              this.loading = false;
            },
          },
        };

        const rzp = new Razorpay(options);

        rzp.on('payment.failed', (response: any) => {
          console.error(response);
          this.toastService.show('Payment Failed', 'error');
          this.loading = false;
        });

        rzp.open();
      },

      error: () => {
        this.toastService.show('Order creation failed', 'error');
        this.loading = false;
      },
    });
  }

  // 🔥 Create Order after payment
  createOrder(paymentId: string) {
    const orderData = {
      orderItems: this.cartItems.map((item) => ({
        product: item.product._id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
      })),
      shippingAddress: this.shippingAddress,
      paymentMethod: 'Razorpay',
      totalPrice: this.total,
      razorpayPaymentId: paymentId,
    };

    this.orderService.createOrder(orderData).subscribe({
      next: () => {
        this.toastService.show('Order placed successfully!', 'success');
        this.cartService.clearCart();
        this.router.navigate(['/orders']);
      },
      error: () => {
        this.toastService.show('Order failed', 'error');
      },
    });
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  toggleAddressEdit() {
    this.isEditingAddress = !this.isEditingAddress;
  }

  autoFill() {
    const user = this.authService.currentUserValue;
    if (!user || !user.address) {
      this.toastService.show('No saved address found in profile', 'info');
      return;
    }

    this.newAddress = {
      country: user.address.country || 'India',
      name: user.name || '',
      mobile: user.phone || '',
      zip: user.address.zip || '',
      house: user.address.house || '',
      area: user.address.area || '',
      landmark: user.address.landmark || '',
      city: user.address.city || '',
      state: user.address.state || '',
    };

    this.toastService.show('Address filled from profile', 'success');
  }

  saveAddress() {
    this.loading = true;
    const formData = new FormData();

    // Append address fields
    formData.append('house', this.newAddress.house);
    formData.append('area', this.newAddress.area);
    formData.append('landmark', this.newAddress.landmark);
    formData.append('city', this.newAddress.city);
    formData.append('state', this.newAddress.state);
    formData.append('zip', this.newAddress.zip);
    formData.append('country', this.newAddress.country);

    // Also update name/phone if changed
    formData.append('name', this.newAddress.name);
    formData.append('phone', this.newAddress.mobile);

    // Construct street for legacy support / display
    const street = `${this.newAddress.house}, ${this.newAddress.area}, ${this.newAddress.landmark}`;
    formData.append('street', street);

    this.authService.updateProfile(formData).subscribe({
      next: (updatedUser) => {
        this.loading = false;
        this.toastService.show('Address saved to profile', 'success');

        // Update local shipping address for display
        this.shippingAddress = {
          name: this.newAddress.name,
          street: street,
          city: this.newAddress.city,
          state: this.newAddress.state,
          zip: this.newAddress.zip,
          country: this.newAddress.country,
        };

        this.toggleAddressEdit();
      },
      error: (error) => {
        this.loading = false;
        console.error('Failed to save address:', error);
        this.toastService.show(
          error.error?.message || 'Failed to save address',
          'error',
        );
      },
    });
  }
}
