import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuditLog, PageResponse, TypeActionAudit } from '../models/audit-log.model';

export interface FiltresAuditLog {
  utilisateur?: string;
  entite?: string;
  action?: TypeActionAudit;
  debut?: string;
  fin?: string;
  page?: number;
  taille?: number;
}

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private apiUrl = `${environment.apiUrl}/audit-logs`;

  constructor(private http: HttpClient) {}

  rechercher(filtres: FiltresAuditLog): Observable<PageResponse<AuditLog>> {
    let params = new HttpParams();
    if (filtres.utilisateur) params = params.set('utilisateur', filtres.utilisateur);
    if (filtres.entite) params = params.set('entite', filtres.entite);
    if (filtres.action) params = params.set('action', filtres.action);
    if (filtres.debut) params = params.set('debut', filtres.debut);
    if (filtres.fin) params = params.set('fin', filtres.fin);
    params = params.set('page', filtres.page ?? 0);
    params = params.set('taille', filtres.taille ?? 20);

    return this.http.get<PageResponse<AuditLog>>(this.apiUrl, { params });
  }

  entitesDisponibles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/entites`);
  }

  actionsDisponibles(): Observable<TypeActionAudit[]> {
    return this.http.get<TypeActionAudit[]>(`${this.apiUrl}/actions`);
  }
}
