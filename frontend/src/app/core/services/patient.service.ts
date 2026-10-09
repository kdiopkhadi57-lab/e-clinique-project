import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Patient } from '../models/patient.model';

export interface PatientImportResult {
  importes: number;
  ignores: number;
  erreurs: string[];
}

@Injectable({ providedIn: 'root' })
export class PatientService {
  private apiUrl = `${environment.apiUrl}/patients`;

  constructor(private http: HttpClient) {}

  findAll(recherche?: string): Observable<Patient[]> {
    const url = recherche ? `${this.apiUrl}?recherche=${encodeURIComponent(recherche)}` : this.apiUrl;
    return this.http.get<Patient[]>(url);
  }

  findById(id: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/${id}`);
  }

  create(patient: Patient, suite?: string, medecinId?: number, consultation?: { type?: string; montant: number; partOrganisme?: number }, rendezVous?: { dateHeure: string; dureeMinutes: number; motif: string }): Observable<Patient> {
    let params = new HttpParams();
    if (suite) params = params.set('suite', suite);
    if (medecinId) params = params.set('medecinId', medecinId);
    if (consultation?.type) params = params.set('typeConsultation', consultation.type);
    if (consultation) params = params.set('montant', consultation.montant);
    if (consultation?.partOrganisme != null) params = params.set('partOrganisme', consultation.partOrganisme);
    if (rendezVous?.dateHeure) params = params.set('dateHeure', rendezVous.dateHeure);
    if (rendezVous) params = params.set('dureeMinutes', rendezVous.dureeMinutes).set('motif', rendezVous.motif || '');
    return this.http.post<Patient>(this.apiUrl, patient, { params });
  }

  update(id: number, patient: Patient): Observable<Patient> {
    return this.http.put<Patient>(`${this.apiUrl}/${id}`, patient);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  importer(fichier: File): Observable<PatientImportResult> {
    const donnees = new FormData();
    donnees.append('fichier', fichier);
    return this.http.post<PatientImportResult>(`${this.apiUrl}/import`, donnees);
  }
}
