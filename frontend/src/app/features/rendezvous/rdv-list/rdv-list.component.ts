import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RendezVous, StatutRendezVous } from '../../../core/models/rendezvous.model';
import { RendezVousService } from '../../../core/services/rendezvous.service';
import { AuthService } from '../../../core/services/auth.service';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';

@Component({
  selector: 'app-rdv-list',
  standalone: true,
  imports: [CommonModule, RouterLink, PaginationComponent],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4><i class="bi bi-calendar-check"></i> Rendez-vous</h4>
      <div class="d-flex gap-2">
        <a routerLink="/rendezvous/calendrier" class="btn btn-outline-primary">
          <i class="bi bi-calendar3"></i> Calendrier
        </a>
        <a routerLink="/rendezvous/nouveau" class="btn btn-primary">
          <i class="bi bi-plus-lg"></i> Nouveau rendez-vous
        </a>
      </div>
    </div>

    <div class="alert alert-danger" *ngIf="erreur">{{ erreur }}</div>
    <div class="alert alert-info" *ngIf="rendezVousCible">
      <strong>Rendez-vous concerné :</strong>
      {{ rendezVousCible.dateHeure | date:'dd/MM/yyyy HH:mm' }} avec Dr. {{ rendezVousCible.medecin?.prenom }} {{ rendezVousCible.medecin?.nom }}
      pour {{ rendezVousCible.patient?.prenom }} {{ rendezVousCible.patient?.nom }}.
    </div>

    <div class="card">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead>
            <tr>
              <th>Date / Heure</th>
              <th>Patient</th>
              <th>Médecin</th>
              <th>Motif</th>
              <th>Statut</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of rendezVousPage">
              <td>{{ r.dateHeure | date:'dd/MM/yyyy HH:mm' }}</td>
              <td>{{ r.patient?.prenom }} {{ r.patient?.nom }}</td>
              <td>Dr. {{ r.medecin?.prenom }} {{ r.medecin?.nom }}</td>
              <td>{{ r.motif || '-' }}</td>
              <td>
                <span class="badge" [ngClass]="badgeClasse(r.statut)">{{ traduireStatut(r.statut) }}</span>
              </td>
              <td class="text-end">
                <div class="btn-group btn-group-sm" *ngIf="r.statut !== 'TERMINE' && r.statut !== 'ANNULE'">
                  <button class="btn btn-outline-success" (click)="changerStatut(r, 'CONFIRME')" title="Confirmer">
                    <i class="bi bi-check-lg"></i>
                  </button>
                  <button class="btn btn-outline-primary" (click)="changerStatut(r, 'TERMINE')" title="Marquer comme effectué">
                    <i class="bi bi-check2-all"></i>
                  </button>
                  <button class="btn btn-outline-danger" (click)="changerStatut(r, 'ANNULE')" title="Annuler">
                    <i class="bi bi-x-lg"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="rendezVousList.length === 0">
              <td colspan="6" class="text-center text-muted py-4">Aucun rendez-vous</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <app-pagination [page]="page" [totalPages]="totalPages" (pageChange)="page = $event"></app-pagination>
  `
})
export class RdvListComponent implements OnInit {
  rendezVousList: RendezVous[] = [];
  erreur = '';
  rendezVousCible: RendezVous | null = null;
  page = 1;
  readonly pageSize = 10;

  constructor(private rendezVousService: RendezVousService, public auth: AuthService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const focusId = Number(this.route.snapshot.queryParamMap.get('focusId'));
    this.charger();
    if (focusId) this.rendezVousService.findById(focusId).subscribe((rdv) => (this.rendezVousCible = rdv));
  }

  charger(): void {
    this.erreur = '';
    this.rendezVousService.findAll().subscribe({
      next: (data) => { this.rendezVousList = data; this.page = 1; },
      error: (err) => (this.erreur = err.error?.message || 'Impossible de charger les rendez-vous')
    });
  }

  get totalPages(): number { return Math.max(1, Math.ceil(this.rendezVousList.length / this.pageSize)); }
  get rendezVousPage(): RendezVous[] {
    const start = (this.page - 1) * this.pageSize;
    return this.rendezVousList.slice(start, start + this.pageSize);
  }

  changerStatut(r: RendezVous, statut: StatutRendezVous): void {
    if (!r.id) return;
    this.rendezVousService.changerStatut(r.id, statut).subscribe(() => this.charger());
  }

  traduireStatut(statut?: StatutRendezVous): string {
    const map: Record<string, string> = {
      PLANIFIE: 'Planifié',
      CONFIRME: 'Confirmé',
      EN_COURS: 'En cours',
      TERMINE: 'Effectué',
      ANNULE: 'Annulé'
    };
    return statut ? map[statut] : '-';
  }

  badgeClasse(statut?: StatutRendezVous): string {
    const map: Record<string, string> = {
      PLANIFIE: 'bg-secondary',
      CONFIRME: 'bg-info',
      EN_COURS: 'bg-primary',
      TERMINE: 'bg-success',
      ANNULE: 'bg-danger'
    };
    return statut ? map[statut] : 'bg-secondary';
  }
}
