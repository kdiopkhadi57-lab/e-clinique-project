import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/** Récupère les PDF (reçus, rapports médicaux) et gère leur ouverture/impression. */
@Injectable({ providedIn: 'root' })
export class DocumentService {
  private apiUrl = `${environment.apiUrl}/documents`;

  constructor(private http: HttpClient) {}

  recuFacture(factureId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/factures/${factureId}/recu`, { responseType: 'blob' });
  }

  factureOrganisme(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/factures-organismes/${id}`, { responseType: 'blob' });
  }

  /** Enregistre un fichier reçu du serveur sous le nom donné. */
  telecharger(blob: Blob, nomFichier: string): void {
    const url = window.URL.createObjectURL(blob);
    const lien = document.createElement('a');
    lien.href = url;
    lien.download = nomFichier;
    lien.click();
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);
  }

  rapportMedical(patientId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/patients/${patientId}/rapport-medical`, { responseType: 'blob' });
  }

  ouvrirEtImprimer(blob: Blob): void {
    const url = window.URL.createObjectURL(blob);
    const fenetre = window.open(url, '_blank');
    if (fenetre) {
      fenetre.onload = () => fenetre.print();
    }
  }

  imprimerPage(): void {
    window.print();
  }
}
