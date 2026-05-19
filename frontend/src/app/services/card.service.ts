import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CardService {
    private apiUrl = 'http://localhost:5000/api/cards';

    constructor(private http: HttpClient) { }

    getCards(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl);
    }

    addCard(card: any): Observable<any[]> {
        return this.http.post<any[]>(this.apiUrl, card);
    }

    deleteCard(id: string): Observable<any[]> {
        return this.http.delete<any[]>(`${this.apiUrl}/${id}`);
    }
}
