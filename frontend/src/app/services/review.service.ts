import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = 'http://localhost:5000/api/reviews';

  constructor(private http: HttpClient) { }

  // Get reviews and stats for a specific product
  getProductReviews(productId: string): Observable<{ reviews: any[], avgRating: number, totalReviews: number }> {
    return this.http.get<{ reviews: any[], avgRating: number, totalReviews: number }>(`${this.apiUrl}/${productId}`);
  }

  // Check if a user is eligible to review (must be logged in + bought the product + completed order)
  canReview(productId: string): Observable<{ canReview: boolean, orderId: string | null, alreadyReviewed: boolean }> {
    return this.http.get<{ canReview: boolean, orderId: string, alreadyReviewed: boolean }>(`${this.apiUrl}/can-review/${productId}`);
  }

  // Post a new review
  addReview(reviewData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, reviewData);
  }
}
