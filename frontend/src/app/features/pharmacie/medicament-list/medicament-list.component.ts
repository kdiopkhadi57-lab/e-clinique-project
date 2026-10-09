import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Medicament } from '../../../core/models/medicament.model';
import { MedicamentService } from '../../../core/services/medicament.service';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';

@Component({
  selector: 'app-medicament-list',
  standalone: true,
  imports: [CommonModule, RouterLink, PaginationComponent],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4><i class="bi bi-capsule"></i> Pharmacie — Médicaments</h4>
      <div class="d-flex gap-2">
        <a routerLink="/pharmacie/mouvements" class="btn btn-outline-secondary">
          <i class="bi bi-clock-history"></i> Historique des mouvements
        </a>
        <a routerLink="/pharmacie/nouveau" class="btn btn-primary">
          <i class="bi bi-plus-lg"></i> Nouveau médicament
        </a>
      </div>
    </div>

    <div class="alert alert-danger" *ngIf="enAlerte.length > 0">
      <i class="bi bi-exclamation-triangle"></i>
      <strong>{{ enAlerte.length }}</strong> médicament(s) en alerte de stock :
      {{ nomsEnAlerte() }}<span *ngIf="enAlerte.length > 5">…</span>
    </div>

    <div class="card">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead>
            <tr>
              <th>Code</th>
              <th>Nom</th>
              <th>Catégorie</th>
              <th class="text-end">Prix unitaire</th>
              <th class="text-end">Stock</th>
              <th>Seuil d'alerte</th>
              <th>Expiration</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let m of medicamentsPage" [class.table-danger]="m.enAlerte">
              <td>{{ m.code }}</td>
              <td>{{ m.nom }}</td>
              <td>{{ m.categorie || '-' }}</td>
              <td class="text-end">{{ m.prixUnitaire | number:'1.0-0' }}</td>
              <td class="text-end">
                {{ m.quantiteStock }}
                <span class="badge badge-alerte ms-1" *ngIf="m.enAlerte">Alerte</span>
              </td>
              <td>{{ m.seuilAlerte }}</td>
              <td>{{ m.dateExpiration || '-' }}</td>
              <td class="text-end">
                <a [routerLink]="['/pharmacie', m.id, 'modifier']" class="btn btn-sm btn-outline-secondary">
                  <i class="bi bi-pencil"></i>
                </a>
              </td>
            </tr>
            <tr *ngIf="medicaments.length === 0">
              <td colspan="8" class="text-center text-muted py-4">Aucun médicament enregistré</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <app-pagination [page]="page" [totalPages]="totalPages" (pageChange)="page = $event"></app-pagination>
  `
})
export class MedicamentListComponent implements OnInit {
  medicaments: Medicament[] = [];
  enAlerte: Medicament[] = [];
  page = 1;
  readonly pageSize = 10;

  constructor(private medicamentService: MedicamentService) {}

  ngOnInit(): void {
    this.medicamentService.findAll().subscribe((data) => { this.medicaments = data; this.page = 1; });
    this.medicamentService.alertes().subscribe((data) => (this.enAlerte = data));
  }

  nomsEnAlerte(): string {
    return this.enAlerte
      .slice(0, 5)
      .map((m) => m.nom)
      .join(', ');
  }

  get totalPages(): number { return Math.max(1, Math.ceil(this.medicaments.length / this.pageSize)); }
  get medicamentsPage(): Medicament[] {
    const start = (this.page - 1) * this.pageSize;
    return this.medicaments.slice(start, start + this.pageSize);
  }
}
