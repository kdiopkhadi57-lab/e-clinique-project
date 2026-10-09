import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Facture, StatutFacture } from '../../../core/models/facture.model';
import { FactureService } from '../../../core/services/facture.service';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';

@Component({
  selector: 'app-facture-list',
  standalone: true,
  imports: [CommonModule, RouterLink, PaginationComponent],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4><i class="bi bi-receipt"></i> Factures</h4>
      <a routerLink="/factures/nouvelle" class="btn btn-primary">
        <i class="bi bi-plus-lg"></i> Nouvelle facture
      </a>
    </div>

    <div class="card">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead>
            <tr>
              <th>N° Facture</th>
              <th>Date</th>
              <th>Patient</th>
              <th class="text-end">Montant (FCFA)</th>
              <th>Statut</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let f of facturesPage">
              <td>{{ f.numeroFacture }}</td>
              <td>{{ f.dateFacture | date:'dd/MM/yyyy' }}</td>
              <td>{{ f.patient?.prenom }} {{ f.patient?.nom }}</td>
              <td class="text-end">{{ f.montantTotal | number:'1.0-0' }}</td>
              <td>
                <span class="badge" [ngClass]="badgeClasse(f.statut)">{{ traduireStatut(f.statut) }}</span>
              </td>
              <td class="text-end">
                <a [routerLink]="['/factures', f.id]" class="btn btn-sm btn-outline-primary">
                  <i class="bi bi-eye"></i> Voir
                </a>
              </td>
            </tr>
            <tr *ngIf="factures.length === 0">
              <td colspan="6" class="text-center text-muted py-4">Aucune facture</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <app-pagination [page]="page" [totalPages]="totalPages" (pageChange)="page = $event"></app-pagination>
  `
})
export class FactureListComponent implements OnInit {
  factures: Facture[] = [];
  page = 1;
  readonly pageSize = 10;

  constructor(private factureService: FactureService) {}

  ngOnInit(): void {
    this.factureService.findAll().subscribe((data) => {
      this.factures = data;
      this.page = 1;
    });
  }

  get totalPages(): number { return Math.max(1, Math.ceil(this.factures.length / this.pageSize)); }
  get facturesPage(): Facture[] {
    const start = (this.page - 1) * this.pageSize;
    return this.factures.slice(start, start + this.pageSize);
  }

  traduireStatut(statut?: StatutFacture): string {
    const map: Record<string, string> = { EN_ATTENTE: 'En attente', PAYEE: 'Payée', ANNULEE: 'Annulée' };
    return statut ? map[statut] : '-';
  }

  badgeClasse(statut?: StatutFacture): string {
    const map: Record<string, string> = { EN_ATTENTE: 'bg-warning text-dark', PAYEE: 'bg-success', ANNULEE: 'bg-danger' };
    return statut ? map[statut] : 'bg-secondary';
  }
}
