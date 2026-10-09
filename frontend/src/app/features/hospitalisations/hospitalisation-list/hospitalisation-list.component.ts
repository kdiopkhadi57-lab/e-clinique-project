import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Facture } from '../../../core/models/facture.model';
import { FactureService } from '../../../core/services/facture.service';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';

@Component({
  selector: 'app-hospitalisation-list',
  standalone: true,
  imports: [CommonModule, RouterLink, PaginationComponent],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h4><i class="bi bi-hospital-fill"></i> Hospitalisations</h4>
        <p class="text-muted mb-0">Suivi des séjours et des montants journaliers</p>
      </div>
      <a routerLink="/factures/nouvelle" class="btn btn-primary">
        <i class="bi bi-plus-lg"></i> Nouvelle hospitalisation
      </a>
    </div>

    <div class="card">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Admission</th>
              <th>Sortie</th>
              <th class="text-center">Jours</th>
              <th class="text-end">Tarif / jour</th>
              <th class="text-end">Montant</th>
              <th>Statut</th>
              <th class="text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let facture of hospitalisationsPage">
              <td>
                <strong>{{ facture.patient?.prenom }} {{ facture.patient?.nom }}</strong>
                <small class="d-block text-muted">{{ facture.numeroFacture }}</small>
              </td>
              <td>{{ facture.dateAdmission | date:'dd/MM/yyyy' }}</td>
              <td>{{ facture.dateSortie ? (facture.dateSortie | date:'dd/MM/yyyy') : 'En cours' }}</td>
              <td class="text-center">{{ facture.joursHospitalisation || 0 }}</td>
              <td class="text-end">{{ facture.prixJournalierHospitalisation || 0 | number:'1.0-0' }} FCFA</td>
              <td class="text-end fw-semibold">{{ montantHospitalisation(facture) | number:'1.0-0' }} FCFA</td>
              <td><span class="badge" [ngClass]="badgeClasse(facture.statut)">{{ traduireStatut(facture.statut) }}</span></td>
              <td class="text-end">
                <a [routerLink]="['/factures', facture.id]" class="btn btn-sm btn-outline-primary" title="Voir la facture">
                  <i class="bi bi-eye"></i>
                </a>
              </td>
            </tr>
            <tr *ngIf="hospitalisations.length === 0">
              <td colspan="8" class="text-center text-muted py-4">Aucune hospitalisation enregistrée</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <app-pagination [page]="page" [totalPages]="totalPages" (pageChange)="page = $event"></app-pagination>
  `
})
export class HospitalisationListComponent implements OnInit {
  hospitalisations: Facture[] = [];
  page = 1;
  readonly pageSize = 10;

  constructor(private factureService: FactureService) {}

  ngOnInit(): void {
    this.factureService.findAll().subscribe((factures) => {
      this.hospitalisations = factures.filter((facture) => !!facture.dateAdmission);
      this.page = 1;
    });
  }

  get totalPages(): number { return Math.max(1, Math.ceil(this.hospitalisations.length / this.pageSize)); }
  get hospitalisationsPage(): Facture[] {
    const start = (this.page - 1) * this.pageSize;
    return this.hospitalisations.slice(start, start + this.pageSize);
  }

  montantHospitalisation(facture: Facture): number {
    return (facture.joursHospitalisation || 0) * (facture.prixJournalierHospitalisation || 0);
  }

  traduireStatut(statut?: string): string {
    const map: Record<string, string> = { EN_ATTENTE: 'En attente', PAYEE: 'Payée', ANNULEE: 'Annulée' };
    return statut ? map[statut] : '-';
  }

  badgeClasse(statut?: string): string {
    const map: Record<string, string> = { EN_ATTENTE: 'bg-warning text-dark', PAYEE: 'bg-success', ANNULEE: 'bg-danger' };
    return statut ? map[statut] : 'bg-secondary';
  }
}
