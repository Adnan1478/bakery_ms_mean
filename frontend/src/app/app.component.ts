import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CartService } from './services/cart.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'frontend';
  showNotification = false;
  notificationMessage = '';

  constructor(private cartService: CartService, private authService: AuthService) {}

  ngOnInit() {
    this.checkCartAbandonment();
  }

  checkCartAbandonment() {
    if (typeof window !== 'undefined') {
      // Wait a few seconds to let user settle before popping notification
      setTimeout(() => {
        const sub = this.cartService.cartItems$.subscribe(items => {
          if (items.length > 0 && !this.showNotification) {
            const user = this.authService.currentUserValue;
            let userName = 'there';
            if (user && user.name) {
              userName = user.name.split(' ')[0]; 
            }

            const productNames = items.map(i => i.product.name);
            const productStr = productNames.length > 1 
              ? `${productNames.slice(0, -1).join(', ')} and ${productNames[productNames.length - 1]}`
              : productNames[0];

            let timeDelayStr = 'a while';
            let discountStr = '10%'; // Mock incentive

            // Cycle sequentially through the 3 templates to avoid random repeats
            let lastOption = parseInt(localStorage.getItem('notificationSeqIdx') || '0', 10);
            const option = (lastOption % 3) + 1;
            localStorage.setItem('notificationSeqIdx', option.toString());
            
            if (option === 1) {
              this.notificationMessage = `Hey ${userName}! 🍰 We noticed you left ${productStr} in your cart. Come back and complete your order before it's gone!`;
            } else if (option === 2) {
              this.notificationMessage = `Hi ${userName}! ⏰ Your ${productStr} has been waiting for ${timeDelayStr}. Complete your checkout now before we run out of stock!`;
            } else {
              this.notificationMessage = `Sweet news, ${userName}! 🧁 Complete your purchase of ${productStr} right now and get ${discountStr} off! Treat yourself today.`;
            }

            this.showNotification = true;

            // Auto close after 10 seconds
            setTimeout(() => {
              this.closeNotification();
            }, 10000);
          }
        });
        
        // Unsubscribe to avoid memory leaks since we only check this on app load
        sub.unsubscribe();
      }, 4000); 
    }
  }

  closeNotification() {
    this.showNotification = false;
  }
}
