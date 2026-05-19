import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class PaymentService {

    private API = 'http://localhost:5000/api/payment';

    constructor(private http: HttpClient) { }

    createOrder(amount: number) {
        return this.http.post(`${this.API}/create-order`, { amount });
    }

    verifyPayment(data: any) {
        return this.http.post(`${this.API}/verify`, data);
    }
}