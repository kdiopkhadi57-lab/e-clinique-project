import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RendezVous, StatutRendezVous } from '../models/rendezvous.model';

@Injectable({ providedIn: 'root' })
export class RendezVousService {
  private apiUrl = `${environment.apiUrl}/rendezvous`;

  constructor(private http: HttpClient) {}

  findAll(filtres?: { patientId?: number; medecinId?: number; debut?: string; fin?: string }): Observable<RendezVous[]> {
    let params = new HttpParams();
    if (filtres?.patientId) params = params.set('patientId', filtres.patientId);
    if (filtres?.medecinId) params = params.set('medecinId', filtres.medecinId);
    if (filtres?.debut) params = params.set('debut', filtres.debut);
    if (filtres?.fin) params = params.set('fin', filtres.fin);
    return this.http.get<RendezVous[]>(this.apiUrl, { params });
  }

  findById(id: number): Observable<RendezVous> {
    return this.http.get<RendezVous>(`${this.apiUrl}/${id}`);
  }

  create(rdv: any): Observable<RendezVous> {
    return this.http.post<RendezVous>(this.apiUrl, rdv);
  }

  update(id: number, rdv: any): Observable<RendezVous> {
    return this.http.put<RendezVous>(`${this.apiUrl}/${id}`, rdv);
  }

  changerStatut(id: number, statut: StatutRendezVous): Observable<RendezVous> {
    return this.http.patch<RendezVous>(`${this.apiUrl}/${id}/statut?statut=${statut}`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
