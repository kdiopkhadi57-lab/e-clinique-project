import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Facture } from '../models/facture.model';
import { FactureOrganisme } from '../models/organisme.model';

export interface EnvoiRequest {
  destinataires?: string;
  message?: string;
  debut?: string;
  fin?: string;
}

export interface EnvoiResultat {
  id?: number;
  reference: string;
  destinataire?: string;
  destinataires?: string;
  envoye: boolean;
  message: string;
}

export interface ParametresEnvoi {
  mailConfigure: boolean;
  emailsComptable: string;
}

/** Envoi par e-mail des factures (organismes, patients) et de l'export comptable. */
@Injectable({ providedIn: 'root' })
export class EnvoiService {
  private apiUrl = `${environment.apiUrl}/envois`;
  private parametres$?: Observable<ParametresEnvoi>;

  constructor(private http: HttpClient) {}

  parametres(): Observable<ParametresEnvoi> {
    this.parametres$ ??= this.http.get<ParametresEnvoi>(`${this.apiUrl}/parametres`).pipe(shareReplay(1));
    return this.parametres$;
  }

  factureOrganisme(id: number, req: EnvoiRequest): Observable<FactureOrganisme> {
    return this.http.post<FactureOrganisme>(`${this.apiUrl}/factures-organismes/${id}`, req);
  }

  facturesOrganismesEnAttente(): Observable<EnvoiResultat[]> {
    return this.http.post<EnvoiResultat[]>(`${this.apiUrl}/factures-organismes/en-attente`, {});
  }

  facturePatient(id: number, req: EnvoiRequest): Observable<Facture> {
    return this.http.post<Facture>(`${this.apiUrl}/factures/${id}`, req);
  }

  exportComptable(req: EnvoiRequest): Observable<EnvoiResultat> {
    return this.http.post<EnvoiResultat>(`${this.apiUrl}/export-comptable`, req);
  }
}
