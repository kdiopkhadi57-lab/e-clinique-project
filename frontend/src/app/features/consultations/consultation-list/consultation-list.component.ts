import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Consultation } from '../../../core/models/consultation.model';
import { ConsultationService } from '../../../core/services/consultation.service';
import { AuthService } from '../../../core/services/auth.service';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';

@Component({
  selector: 'app-consultation-list',
  standalone: true,
  imports: [CommonModule, RouterLink, PaginationComponent],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h4 class="mb-1"><i class="bi bi-journal-medical"></i> Consultations</h4>
        <p class="text-muted mb-0">Historique des consultations disponibles.</p>
      </div>
      <a *ngIf="auth.hasRole('ADMIN','MEDECIN')" routerLink="/consultations/nouvelle" class="btn btn-primary">
        <i class="bi bi-plus-lg"></i> Nouvelle consultation
      </a>
    </div>

    <div class="card">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>Date</th>
              <th>Patient</th>
              <th>Type</th>
              <th>Médecin</th>
              <th>Motif</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let consultation of consultationsPage">
              <td>{{ consultation.dateConsultation | date:'dd/MM/yyyy HH:mm' }}</td>
              <td>
                <strong>{{ consultation.patient.prenom }} {{ consultation.patient.nom }}</strong>
                <small class="d-block text-muted">{{ consultation.patient.numeroDossier }}</small>
              </td>
              <td>
                <span class="badge" [class.bg-info]="consultation.type !== 'SPECIALISEE'" [class.bg-warning]="consultation.type === 'SPECIALISEE'">
                  {{ consultation.type === 'SPECIALISEE' ? 'Spécialisée' : 'Générale' }}
                </span>
              </td>
              <td>Dr. {{ consultation.medecin.prenom }} {{ consultation.medecin.nom }}</td>
              <td>{{ consultation.motif || '-' }}</td>
              <td class="text-end">
                <a class="btn btn-sm btn-outline-primary" [routerLink]="['/consultations', consultation.id]" title="Voir et imprimer la consultation">
                  <i class="bi bi-printer"></i>
                </a>
              </td>
            </tr>
            <tr *ngIf="consultations.length === 0">
              <td colspan="6" class="text-center text-muted py-4">Aucune consultation enregistrée.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <app-pagination [page]="page" [totalPages]="totalPages" (pageChange)="page = $event"></app-pagination>
  `
})
export class ConsultationListComponent implements OnInit {
  consultations: Consultation[] = [];
  page = 1;
  readonly pageSize = 10;

  constructor(private consultationService: ConsultationService, public auth: AuthService) {}

  ngOnInit(): void {
    this.consultationService.findAll().subscribe((consultations) => {
      this.consultations = consultations;
      this.page = 1;
    });
  }

  get totalPages(): number { return Math.max(1, Math.ceil(this.consultations.length / this.pageSize)); }
  get consultationsPage(): Consultation[] {
    const start = (this.page - 1) * this.pageSize;
    return this.consultations.slice(start, start + this.pageSize);
  }
}