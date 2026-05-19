import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit {
  orders: any[] = [];
  filteredOrders: any[] = [];
  loading = true;
  activeTab: string = 'All Order';
  searchText: string = '';
  expandedOrderId: string | null = null;

  // Steps for the live tracker
  readonly orderSteps = [
    { key: 'pending',    label: 'Order Placed',    icon: '📦' },
    { key: 'processing', label: 'Baking',           icon: '🔥' },
    { key: 'ready',      label: 'Quality Check',    icon: '✅' },
    { key: 'completed',  label: 'Delivered',        icon: '🎉' },
  ];

  tabs = ['All Order', 'Pending', 'Completed', 'Cancelled'];

  // Mock counts, will update with real data
  counts: { [key: string]: number } = {
    'All Order': 0,
    'Pending': 0,
    'Completed': 0,
    'Cancelled': 0
  };

  constructor(private orderService: OrderService) { }

  ngOnInit() {
    this.orderService.getMyOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.calculateCounts();
        this.filterOrders();
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  cancelOrder(order: any) {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.orderService.cancelOrder(order._id).subscribe({
        next: (updatedOrder) => {
          // Update the local order status
          const index = this.orders.findIndex(o => o._id === updatedOrder._id);
          if (index !== -1) {
            this.orders[index] = updatedOrder;
          }
          this.calculateCounts();
          this.filterOrders();
        },
        error: (err) => {
          console.error('Failed to cancel order:', err);
          alert(err.error?.message || 'Failed to cancel order');
        }
      });
    }
  }

  calculateCounts() {
    this.counts['All Order'] = this.orders.length;
    this.counts['Pending'] = this.orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
    this.counts['Completed'] = this.orders.filter(o => o.status === 'completed' || o.status === 'ready').length;
    this.counts['Cancelled'] = this.orders.filter(o => o.status === 'cancelled').length;
  }

  setTab(tab: string) {
    this.activeTab = tab;
    this.filterOrders();
  }

  filterOrders() {
    let temp = this.orders;

    // Filter by Tab
    if (this.activeTab === 'Pending') {
      temp = temp.filter(o => o.status === 'pending' || o.status === 'processing');
    } else if (this.activeTab === 'Completed') {
      temp = temp.filter(o => o.status === 'completed' || o.status === 'ready');
    } else if (this.activeTab === 'Cancelled') {
      temp = temp.filter(o => o.status === 'cancelled');
    }

    // Filter by Search
    if (this.searchText) {
      const lower = this.searchText.toLowerCase();
      temp = temp.filter(o =>
        o._id.toLowerCase().includes(lower) ||
        o.items.some((i: any) => i.name.toLowerCase().includes(lower))
      );
    }

    this.filteredOrders = temp;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':
      case 'processing': return 'status-pending'; // Yellow/Orange
      case 'completed':
      case 'ready': return 'status-delivered'; // Green
      case 'cancelled': return 'status-cancelled'; // Red
      default: return '';
    }
  }

  // Helper to get display status text matching the design
  getDisplayStatus(status: string): string {
    if (status === 'processing') return 'Pending'; // or Processing
    if (status === 'ready') return 'Delivered';
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  // Generate a random-ish mock image color or src if needed
  getProductImage(item: any): string {
    // Placeholder logic
    return 'assets/images/placeholder-product.png';
  }

  toggleTracker(orderId: string) {
    this.expandedOrderId = this.expandedOrderId === orderId ? null : orderId;
  }

  getStepIndex(status: string): number {
    if (status === 'cancelled') return -1;
    return this.orderSteps.findIndex(s => s.key === status);
  }

  generateInvoice(order: any) {
    import('jspdf').then(jsPDFModule => {
      import('jspdf-autotable').then(autoTableModule => {
        const jsPDF = jsPDFModule.default;
        const autoTable = autoTableModule.default;

        const doc = new jsPDF();

        // --- Colors ---
        const bgCream = '#fbf6e9'; // Light Cream matching the image
        const darkBrown = '#4a3b32'; // Dark Coffee/Wood

        // Background
        doc.setFillColor(bgCream);
        doc.rect(0, 0, 210, 297, 'F');

        // --- Header Image ---
        // Using a reliable Unsplash bakery image suitable for a banner
        const imgUrl = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';

        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = imgUrl;

        img.onload = () => {
          try {
            // Image ratio preservation not strictly needed for banner, just crop/fill
            doc.addImage(img, 'JPEG', 0, 0, 210, 60);
          } catch (e) {
            // Fallback if image fails (CORS etc)
            doc.setFillColor(darkBrown);
            doc.rect(0, 0, 210, 60, 'F');
          }
          this.drawInvoiceContent(doc, autoTable, order, darkBrown);
        };

        img.onerror = () => {
          // Fallback if image fails
          doc.setFillColor(darkBrown);
          doc.rect(0, 0, 210, 60, 'F');
          this.drawInvoiceContent(doc, autoTable, order, darkBrown);
        };
      });
    });
  }

  drawInvoiceContent(doc: any, autoTable: any, order: any, themeColor: string) {
    // --- Logo Box ---
    doc.setFillColor(themeColor);
    doc.rect(140, 10, 55, 40, 'F');

    doc.setTextColor('#ffffff');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('BAKE', 167.5, 22, { align: 'center' });
    doc.text('DELIGHT', 167.5, 29, { align: 'center' });
    doc.text('SHOP', 167.5, 36, { align: 'center' });

    // --- Info Section ---
    const startY = 80;
    doc.setTextColor(themeColor);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');

    // Labels
    doc.text('ISSUED TO', 15, startY);
    doc.text('INVOICE NO.', 90, startY);
    doc.text('DATE ISSUED', 150, startY);

    doc.setFont('helvetica', 'normal');
    // Values
    const userName = order.user?.name || 'Customer';
    const invoiceNo = `2023-${order._id.slice(-4).toUpperCase()}`;
    const dateIssued = new Date(order.createdAt).toLocaleDateString();

    doc.text(userName, 15, startY + 7);
    doc.text(invoiceNo, 90, startY + 7);
    doc.text(dateIssued, 150, startY + 7);

    // --- Table ---
    // Custom table design to match image: Minimalist, just lines
    const tableBody = order.items.map((item: any) => [
      `0${item.quantity}`, // Pad quantity
      item.name,
      'Delicious bakery item', // Description placeholder or use actual if avail
      `Rs. ${(item.quantity * item.price).toFixed(0)}`
    ]);

    autoTable(doc, {
      startY: startY + 20,
      head: [['QTY.', 'ITEM', 'DESCRIPTION', 'TOTAL']],
      body: tableBody,
      theme: 'plain', // Minimalist
      styles: {
        fillColor: false,
        textColor: themeColor,
        font: 'helvetica',
        fontSize: 10,
        cellPadding: { top: 5, bottom: 5, left: 0, right: 0 }
      },
      headStyles: {
        fontStyle: 'bold',
        textColor: themeColor,
        fontSize: 9,
        halign: 'left'
      },
      columnStyles: {
        0: { cellWidth: 20 }, // Qty
        1: { cellWidth: 50 }, // Item
        2: { cellWidth: 90 }, // Desc
        3: { halign: 'right' } // Total
      },
      didDrawPage: (data: any) => {
        // Header line
        doc.setDrawColor(themeColor);
        doc.setLineWidth(0.5);
        doc.line(15, data.settings.startY, 195, data.settings.startY);

        // Header bottom line
        doc.line(15, data.settings.startY + 10, 195, data.settings.startY + 10);
      },
      margin: { left: 15, right: 15 }
    });

    // --- Footer / Totals ---
    // @ts-ignore
    const finalY = doc.lastAutoTable.finalY || startY + 40;

    // Bottom line of table
    doc.setDrawColor(themeColor);
    doc.setLineWidth(1); // Thicker
    doc.line(15, finalY, 195, finalY);

    // Subtotal
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('SUBTOTAL', 15, finalY + 15);
    doc.text(`Rs. ${order.totalAmount.toFixed(0)}`, 195, finalY + 15, { align: 'right' });

    // Bottom separator
    doc.setLineWidth(0.5);
    doc.line(15, finalY + 25, 195, finalY + 25);

    // Account Info (Design footer)
    const footerY = 250; // Pin to bottom area
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('ACCOUNT NAME', 15, footerY);

    doc.setFont('helvetica', 'normal');
    doc.text('Bakery Shop Admin', 15, footerY + 6);

    doc.setFont('helvetica', 'bold');
    doc.text('ACCOUNT NUMBER', 15, footerY + 20);

    doc.setFont('helvetica', 'normal');
    doc.text('4929 4802 4199 1375', 15, footerY + 6 + 20);

    doc.save(`invoice_${order._id.slice(-6)}.pdf`);
  }
}
