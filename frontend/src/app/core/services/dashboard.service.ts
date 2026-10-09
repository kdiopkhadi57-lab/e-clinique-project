import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardStats {
  totalPatients: number;
  rendezVousAujourdhui: number;
  rendezVousPlanifies: number;
  facturesEnAttente: number;
  medicamentsEnAlerte: number;
  chiffreAffaires: number;
  encaissementsTotal: number;
  encaissementsAujourdhui: number;
  encaissementsConsultations: number;
  encaissementsRendezVous: number;
  priseEnChargeOrganismes: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  stats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }
}
