import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MouvementStock, MouvementStockRequest } from '../models/medicament.model';

@Injectable({ providedIn: 'root' })
export class StockService {
  private apiUrl = `${environment.apiUrl}/stock`;

  constructor(private http: HttpClient) {}

  historique(medicamentId?: number): Observable<MouvementStock[]> {
    const url = medicamentId ? `${this.apiUrl}/mouvements?medicamentId=${medicamentId}` : `${this.apiUrl}/mouvements`;
    return this.http.get<MouvementStock[]>(url);
  }

  enregistrer(request: MouvementStockRequest): Observable<MouvementStock> {
    return this.http.post<MouvementStock>(`${this.apiUrl}/mouvements`, request);
  }
}
