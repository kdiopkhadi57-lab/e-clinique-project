import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Medicament } from '../models/medicament.model';

@Injectable({ providedIn: 'root' })
export class MedicamentService {
  private apiUrl = `${environment.apiUrl}/medicaments`;

  constructor(private http: HttpClient) {}

  findAll(): Observable<Medicament[]> {
    return this.http.get<Medicament[]>(this.apiUrl);
  }

  alertes(): Observable<Medicament[]> {
    return this.http.get<Medicament[]>(`${this.apiUrl}/alertes`);
  }

  bientotPerimes(jours = 30): Observable<Medicament[]> {
    return this.http.get<Medicament[]>(`${this.apiUrl}/bientot-perimes?jours=${jours}`);
  }

  findById(id: number): Observable<Medicament> {
    return this.http.get<Medicament>(`${this.apiUrl}/${id}`);
  }

  create(m: Medicament): Observable<Medicament> {
    return this.http.post<Medicament>(this.apiUrl, m);
  }

  update(id: number, m: Medicament): Observable<Medicament> {
    return this.http.put<Medicament>(`${this.apiUrl}/${id}`, m);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
