import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ModePaiement } from '../models/facture.model';
import { FactureOrganisme, FactureOrganismeRequest, PriseEnCharge } from '../models/organisme.model';

@Injectable({ providedIn: 'root' })
export class FactureOrganismeService {
  private apiUrl = `${environment.apiUrl}/factures-organismes`;
  constructor(private http: HttpClient) {}
  findAll(organismeId?: number): Observable<FactureOrganisme[]> {
    return this.http.get<FactureOrganisme[]>(organismeId ? `${this.apiUrl}?organismeId=${organismeId}` : this.apiUrl);
  }
  findById(id: number): Observable<FactureOrganisme> { return this.http.get<FactureOrganisme>(`${this.apiUrl}/${id}`); }
  apercu(req: FactureOrganismeRequest): Observable<PriseEnCharge[]> { return this.http.post<PriseEnCharge[]>(`${this.apiUrl}/apercu`, req); }
  creer(req: FactureOrganismeRequest): Observable<FactureOrganisme> { return this.http.post<FactureOrganisme>(this.apiUrl, req); }
  payer(id: number, modePaiement: ModePaiement): Observable<FactureOrganisme> {
    return this.http.patch<FactureOrganisme>(`${this.apiUrl}/${id}/payer?modePaiement=${modePaiement}`, {});
  }
  annuler(id: number): Observable<FactureOrganisme> { return this.http.patch<FactureOrganisme>(`${this.apiUrl}/${id}/annuler`, {}); }
}
