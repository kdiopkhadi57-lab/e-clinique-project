import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MedicamentService } from '../../../core/services/medicament.service';

@Component({
  selector: 'app-medicament-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h4 class="mb-3">
      <i class="bi bi-capsule"></i> {{ medicamentId ? 'Modifier le médicament' : 'Nouveau médicament' }}
    </h4>

    <div class="alert alert-danger" *ngIf="erreur">{{ erreur }}</div>

    <div class="card p-4">
      <form [formGroup]="form" (ngSubmit)="enregistrer()">
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label">Code *</label>
            <input class="form-control" formControlName="code" [readonly]="!!medicamentId">
          </div>
          <div class="col-md-5">
            <label class="form-label">Nom *</label>
            <input class="form-control" formControlName="nom">
          </div>
          <div class="col-md-4">
            <label class="form-label">Catégorie</label>
            <input class="form-control" formControlName="categorie">
          </div>
          <div class="col-md-4">
            <label class="form-label">Forme</label>
            <input class="form-control" formControlName="forme" placeholder="comprimé, sirop...">
          </div>
          <div class="col-md-4">
            <label class="form-label">Unité</label>
            <input class="form-control" formControlName="unite" placeholder="boîte, flacon...">
          </div>
          <div class="col-md-4">
            <label class="form-label">Prix unitaire (FCFA) *</label>
            <input type="number" class="form-control" formControlName="prixUnitaire">
          </div>
          <div class="col-12">
            <label class="form-label">Description</label>
            <textarea class="form-control" rows="2" formControlName="description"></textarea>
          </div>
          <div class="col-md-4" *ngIf="!medicamentId">
            <label class="form-label">Stock initial</label>
            <input type="number" class="form-control" formControlName="quantiteStock">
          </div>
          <div class="col-md-4">
            <label class="form-label">Seuil d'alerte *</label>
            <input type="number" class="form-control" formControlName="seuilAlerte">
          </div>
          <div class="col-md-4">
            <label class="form-label">Date d'expiration</label>
            <input type="date" class="form-control" formControlName="dateExpiration">
          </div>
          <div class="col-md-6">
            <label class="form-label">Fournisseur</label>
            <input class="form-control" formControlName="fournisseur">
          </div>
        </div>

        <div class="mt-4 d-flex gap-2">
          <button type="submit" class="btn btn-primary btn-save" [disabled]="form.invalid">
            <i class="bi bi-save"></i> Enregistrer
          </button>
          <button type="button" class="btn btn-outline-secondary" (click)="router.navigate(['/pharmacie'])">Annuler</button>
        </div>
      </form>
    </div>
  `
})
export class MedicamentFormComponent implements OnInit {
  medicamentId: number | null = null;
  erreur = '';

  form = this.fb.group({
    code: ['', Validators.required],
    nom: ['', Validators.required],
    categorie: [''],
    forme: [''],
    unite: [''],
    description: [''],
    prixUnitaire: [0, [Validators.required, Validators.min(0)]],
    quantiteStock: [0],
    seuilAlerte: [10, Validators.required],
    dateExpiration: [''],
    fournisseur: ['']
  });

  constructor(
    private fb: FormBuilder,
    private medicamentService: MedicamentService,
    private route: ActivatedRoute,
    public router: Router
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.medicamentId = +idParam;
      this.medicamentService.findById(this.medicamentId).subscribe((m) => this.form.patchValue(m as any));
    }
  }

  enregistrer(): void {
    if (this.form.invalid) return;
    const donnees = this.form.getRawValue() as any;

    const operation = this.medicamentId
      ? this.medicamentService.update(this.medicamentId, donnees)
      : this.medicamentService.create(donnees);

    operation.subscribe({
      next: () => this.router.navigate(['/pharmacie']),
      error: (err) => (this.erreur = err.error?.message || 'Erreur lors de l’enregistrement')
    });
  }
}
