import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OrganismeService } from '../../core/services/organisme.service';
import { CreanceOrganisme, Organisme } from '../../core/models/organisme.model';

@Component({
  selector: 'app-organismes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="mb-0"><i class="bi bi-building"></i> Assurances & IPM</h4>
      <a routerLink="/factures-organismes" class="btn btn-primary"><i class="bi bi-receipt"></i> Factures organismes</a>
    </div>

    <div class="alert alert-success py-2" *ngIf="message">{{ message }}</div>
    <div class="alert alert-danger py-2" *ngIf="erreurSuppression">{{ erreurSuppression }}</div>

    <div class="row g-3">
      <div class="col-lg-8">
        <div class="card p-3">
          <h6>Organismes et créances</h6>
          <div class="table-responsive">
            <table class="table table-sm align-middle mb-0">
              <thead><tr><th>Organisme</th><th>Type</th><th class="text-end">Taux</th><th class="text-end">Prises en charge</th>
                <th class="text-end">Non facturé</th><th class="text-end">Facturé en attente</th><th class="text-end">Payé</th><th></th></tr></thead>
              <tbody>
                <tr *ngFor="let o of organismes" [class.text-muted]="!o.actif">
                  <td><strong>{{ o.nom }}</strong> <span *ngIf="!o.actif" class="badge bg-secondary">inactif</span>
                    <div class="small text-muted">{{ o.contact }} {{ o.telephone }}</div></td>
                  <td><span class="badge" [class.bg-primary]="o.type === 'ASSURANCE'" [class.bg-info]="o.type === 'IPM'">{{ o.type === 'IPM' ? 'IPM' : 'Assurance' }}</span></td>
                  <td class="text-end text-nowrap">{{ o.tauxPriseEnCharge }} %</td>
                  <td class="text-end">{{ creance(o)?.nombrePrisesEnCharge || 0 }}</td>
                  <td class="text-end">{{ (creance(o)?.nonFacture || 0) | number:'1.0-0' }}</td>
                  <td class="text-end">{{ (creance(o)?.factureEnAttente || 0) | number:'1.0-0' }}</td>
                  <td class="text-end">{{ (creance(o)?.paye || 0) | number:'1.0-0' }}</td>
                  <td class="text-end text-nowrap">
                    <button class="btn btn-sm btn-outline-secondary me-1" title="Modifier" (click)="modifier(o)"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger" title="Supprimer" (click)="supprimer(o)"><i class="bi bi-trash"></i></button>
                  </td>
                </tr>
              </tbody>
              <tfoot *ngIf="creances.length">
                <tr class="fw-semibold"><td colspan="4">Total (FCFA)</td>
                  <td class="text-end">{{ somme('nonFacture') | number:'1.0-0' }}</td>
                  <td class="text-end">{{ somme('factureEnAttente') | number:'1.0-0' }}</td>
                  <td class="text-end">{{ somme('paye') | number:'1.0-0' }}</td><td></td></tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <div class="col-lg-4">
        <div class="card p-3">
          <h6>{{ edition.id ? 'Modifier ' + edition.nom : 'Ajouter un organisme' }}</h6>
          <label class="form-label">Nom *</label>
          <input class="form-control mb-2" [(ngModel)]="edition.nom" placeholder="ex : IPM Sococim">
          <label class="form-label">Type *</label>
          <select class="form-select mb-2" [(ngModel)]="edition.type">
            <option value="ASSURANCE">Assurance</option>
            <option value="IPM">IPM d'entreprise</option>
          </select>
          <label class="form-label">Taux de prise en charge par défaut (%)</label>
          <input class="form-control mb-2" type="number" min="0" max="100" [(ngModel)]="edition.tauxPriseEnCharge">
          <label class="form-label">Personne de contact</label>
          <input class="form-control mb-2" [(ngModel)]="edition.contact">
          <label class="form-label">Téléphone</label>
          <input class="form-control mb-2" [(ngModel)]="edition.telephone">
          <label class="form-label">Email</label>
          <input class="form-control mb-2" type="email" [(ngModel)]="edition.email">
          <label class="form-label">Adresse</label>
          <input class="form-control mb-2" [(ngModel)]="edition.adresse">
          <label class="form-label">NINEA</label>
          <input class="form-control mb-2" [(ngModel)]="edition.ninea">
          <div class="form-check mb-3">
            <input class="form-check-input" type="checkbox" id="actif" [(ngModel)]="edition.actif">
            <label class="form-check-label" for="actif">Actif (proposé dans le formulaire patient)</label>
          </div>
          <div class="alert alert-danger py-2" *ngIf="erreur">{{ erreur }}</div>
          <div class="d-flex gap-2">
            <button class="btn btn-primary" (click)="enregistrer()" [disabled]="!edition.nom"><i class="bi bi-save"></i> Enregistrer</button>
            <button class="btn btn-outline-secondary" *ngIf="edition.id" (click)="reinitialiser()">Annuler</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class OrganismesComponent implements OnInit {
  organismes: Organisme[] = [];
  creances: CreanceOrganisme[] = [];
  edition: Organisme = this.vide();
  erreur = '';
  message = '';
  erreurSuppression = '';

  constructor(private service: OrganismeService) {}

  ngOnInit(): void { this.charger(); }

  charger(): void {
    this.service.findAll().subscribe((o) => (this.organismes = o));
    this.service.creances().subscribe((c) => (this.creances = c));
  }

  creance(o: Organisme): CreanceOrganisme | undefined {
    return this.creances.find((c) => c.organismeId === o.id);
  }

  somme(champ: 'nonFacture' | 'factureEnAttente' | 'paye'): number {
    return this.creances.reduce((s, c) => s + c[champ], 0);
  }

  modifier(o: Organisme): void { this.edition = { ...o }; this.erreur = ''; }

  reinitialiser(): void { this.edition = this.vide(); this.erreur = ''; }

  supprimer(o: Organisme): void {
    if (!o.id || !confirm(`Supprimer définitivement ${o.nom} ?`)) return;
    this.message = '';
    this.erreurSuppression = '';
    this.service.delete(o.id).subscribe({
      next: () => {
        if (this.edition.id === o.id) this.reinitialiser();
        this.message = `${o.nom} a été supprimé.`;
        this.charger();
      },
      error: (err) => (this.erreurSuppression = err.error?.message || 'La suppression a échoué.')
    });
  }

  enregistrer(): void {
    const operation = this.edition.id
      ? this.service.update(this.edition.id, this.edition)
      : this.service.create(this.edition);
    operation.subscribe({
      next: () => { this.reinitialiser(); this.charger(); },
      error: (err) => (this.erreur = err.error?.message || 'Erreur lors de l\'enregistrement')
    });
  }

  private vide(): Organisme {
    return { nom: '', type: 'IPM', tauxPriseEnCharge: 80, actif: true };
  }
}
