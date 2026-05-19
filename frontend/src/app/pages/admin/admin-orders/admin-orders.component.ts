import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../services/order.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.css']
})
export class AdminOrdersComponent implements OnInit {
  orders: any[] = [];
  loading = false;
  statuses = ['pending', 'processing', 'ready', 'completed', 'cancelled'];

  // Modal State
  selectedOrder: any = null;
  showModal = false;

  constructor(
    private orderService: OrderService,
    private toast: ToastService
  ) { }

  ngOnInit() {
    this.loadOrders();
  }

  viewOrder(order: any) {
    this.selectedOrder = order;
    this.showModal = true;
  }

  loadOrders() {
    this.loading = true;
    this.orderService.getAllOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.toast.show('Failed to load orders', 'error');
      }
    });
  }

  updateStatus(order: any, newStatus: string) {
    if (confirm(`Update order #${order._id.slice(-6)} to ${newStatus}?`)) {
      this.orderService.updateOrderStatus(order._id, newStatus).subscribe({
        next: (res) => {
          order.status = newStatus;
          this.toast.show('Order status updated', 'success');
        },
        error: (err) => {
          this.toast.show('Failed to update status', 'error');
        }
      });
    } else {
      this.loadOrders();
    }
  }
}
