import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../../services/dashboard.service';

declare const Chart: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  stats: any = {
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalSales: 0,
    dailySales: [],
    recentOrders: [],
    topProducts: []
  };
  loading = true;
  private dataReady = false;
  private viewReady = false;

  constructor(private dashboardService: DashboardService) { }

  ngOnInit() {
    // Inject Chart.js from CDN if not present
    if (typeof (window as any).Chart === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.onload = () => { /* Chart.js ready */ };
      document.head.appendChild(script);
    }

    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
        this.dataReady = true;
        this.tryRenderCharts();
      },
      error: (err) => {
        console.error('Error fetching stats', err);
        this.loading = false;
      }
    });
  }

  ngAfterViewInit() {
    this.viewReady = true;
    this.tryRenderCharts();
  }

  private tryRenderCharts() {
    if (!this.dataReady || !this.viewReady) return;

    // Wait for Chart.js to be available (it may still be loading from CDN)
    const waitForChart = setInterval(() => {
      if (typeof (window as any).Chart !== 'undefined') {
        clearInterval(waitForChart);
        setTimeout(() => {
          this.renderRevenueChart();
          this.renderTopProductsChart();
        }, 100);
      }
    }, 200);
  }

  private renderRevenueChart() {
    const canvas = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (!canvas) return;

    // Sort by date ascending
    const sorted = [...(this.stats.dailySales || [])].sort((a: any, b: any) =>
      a._id.localeCompare(b._id)
    );

    const labels = sorted.map((d: any) => {
      const dt = new Date(d._id);
      return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    });
    const data = sorted.map((d: any) => d.total);

    new (window as any).Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Revenue (₹)',
          data,
          fill: true,
          backgroundColor: 'rgba(99,102,241,0.08)',
          borderColor: '#6366f1',
          borderWidth: 3,
          tension: 0.45,
          pointBackgroundColor: '#6366f1',
          pointRadius: 5,
          pointHoverRadius: 8,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx: any) => ` ₹${ctx.parsed.y.toLocaleString('en-IN')}`
            }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: {
              callback: (v: number) => `₹${v.toLocaleString('en-IN')}`
            }
          }
        }
      }
    });
  }

  private renderTopProductsChart() {
    const canvas = document.getElementById('topProductsChart') as HTMLCanvasElement;
    if (!canvas) return;

    const top = this.stats.topProducts || [];
    if (top.length === 0) return;

    const labels = top.map((p: any) => p.name || 'Unknown');
    const data   = top.map((p: any) => p.totalSold);
    const colors = ['#6366f1', '#f5a623', '#10b981', '#e8622a', '#3b82f6'];

    new (window as any).Chart(canvas, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#fff',
          hoverOffset: 10,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { padding: 16, font: { size: 12 } }
          },
          tooltip: {
            callbacks: {
              label: (ctx: any) => ` ${ctx.label}: ${ctx.parsed} sold`
            }
          }
        },
        cutout: '60%'
      }
    });
  }
}
