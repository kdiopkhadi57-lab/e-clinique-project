import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MouvementStock, TypeMouvementStock } from '../../../core/models/medicament.model';
import { Medicament } from '../../../core/models/medicament.model';
import { StockService } from '../../../core/services/stock.service';
import { MedicamentService } from '../../../core/services/medicament.service';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';

@Component({
  selector: 'app-stock-mouvements',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, PaginationComponent],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4><i class="bi bi-clock-history"></i> Mouvements de stock</h4>
      <a routerLink="/pharmacie" class="btn btn-outline-secondary">
        <i class="bi bi-arrow-left"></i> Retour à la pharmacie
      </a>
    </div>

    <div class="alert alert-success" *ngIf="message">{{ message }}</div>
    <div class="alert alert-danger" *ngIf="erreur">{{ erreur }}</div>

    <div class="card p-4 mb-4">
      <h6 class="text-primary">Enregistrer un mouvement manuel</h6>
      <form [formGroup]="form" (ngSubmit)="enregistrer()" class="row g-3 align-items-end">
        <div class="col-md-4">
          <label class="form-label">Médicament</label>
          <select class="form-select" formControlName="medicamentId">
            <option value="">-- Choisir --</option>
            <option *ngFor="let m of medicaments" [value]="m.id">{{ m.nom }} (stock: {{ m.quantiteStock }})</option>
          </select>
        </div>
        <div class="col-md-2">
          <label class="form-label">Type</label>
          <select class="form-select" formControlName="type">
            <option value="ENTREE">Entrée</option>
            <option value="SORTIE">Sortie</option>
            <option value="AJUSTEMENT">Ajustement</option>
          </select>
        </div>
        <div class="col-md-2">
          <label class="form-label">Quantité</label>
          <input type="number" class="form-control" formControlName="quantite">
        </div>
        <div class="col-md-3">
          <label class="form-label">Motif</label>
          <input class="form-control" formControlName="motif" placeholder="ex: Réapprovisionnement">
        </div>
        <div class="col-md-1">
          <button type="submit" class="btn btn-primary btn-save w-100" [disabled]="form.invalid">
            <i class="bi bi-check-lg"></i>
          </button>
        </div>
      </form>
    </div>

    <div class="card">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead>
            <tr>
              <th>Date</th>
              <th>Médicament</th>
              <th>Type</th>
              <th class="text-end">Quantité</th>
              <th class="text-end">Stock après</th>
              <th>Motif</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let m of mouvementsPage">
              <td>{{ m.dateMouvement | date:'dd/MM/yyyy HH:mm' }}</td>
              <td>{{ m.medicament?.nom }}</td>
              <td>
                <span class="badge" [ngClass]="badgeClasse(m.type)">{{ traduireType(m.type) }}</span>
              </td>
              <td class="text-end">{{ m.quantite }}</td>
              <td class="text-end">{{ m.stockApresMouvement }}</td>
              <td>{{ m.motif || '-' }}</td>
            </tr>
            <tr *ngIf="mouvements.length === 0">
              <td colspan="6" class="text-center text-muted py-4">Aucun mouvement enregistré</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <app-pagination [page]="page" [totalPages]="totalPages" (pageChange)="page = $event"></app-pagination>
  `
})
export class StockMouvementsComponent implements OnInit {
  medicaments: Medicament[] = [];
  mouvements: MouvementStock[] = [];
  message = '';
  erreur = '';
  page = 1;
  readonly pageSize = 10;

  form = this.fb.group({
    medicamentId: ['', Validators.required],
    type: ['ENTREE' as TypeMouvementStock, Validators.required],
    quantite: [1, [Validators.required, Validators.min(1)]],
    motif: ['']
  });

  constructor(
    private fb: FormBuilder,
    private stockService: StockService,
    private medicamentService: MedicamentService
  ) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.medicamentService.findAll().subscribe((data) => (this.medicaments = data));
    this.stockService.historique().subscribe((data) => { this.mouvements = data; this.page = 1; });
  }

  get totalPages(): number { return Math.max(1, Math.ceil(this.mouvements.length / this.pageSize)); }
  get mouvementsPage(): MouvementStock[] {
    const start = (this.page - 1) * this.pageSize;
    return this.mouvements.slice(start, start + this.pageSize);
  }

  enregistrer(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.message = '';
    this.erreur = '';

    this.stockService
      .enregistrer({
        medicamentId: Number(v.medicamentId),
        type: v.type as TypeMouvementStock,
        quantite: Number(v.quantite),
        motif: v.motif || undefined
      })
      .subscribe({
        next: () => {
          this.message = 'Mouvement de stock enregistré avec succès.';
          this.form.reset({ type: 'ENTREE', quantite: 1, medicamentId: '', motif: '' });
          this.charger();
        },
        error: (err) => (this.erreur = err.error?.message || 'Erreur lors de l’enregistrement du mouvement')
      });
  }

  traduireType(type: TypeMouvementStock): string {
    const map: Record<string, string> = { ENTREE: 'Entrée', SORTIE: 'Sortie', AJUSTEMENT: 'Ajustement' };
    return map[type];
  }

  badgeClasse(type: TypeMouvementStock): string {
    const map: Record<string, string> = { ENTREE: 'bg-success', SORTIE: 'bg-warning text-dark', AJUSTEMENT: 'bg-secondary' };
    return map[type];
  }
}
