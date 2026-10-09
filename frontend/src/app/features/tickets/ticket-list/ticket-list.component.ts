import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Notification } from '../../../core/models/notification.model';
import { NotificationService } from '../../../core/services/notification.service';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div><h4 class="mb-1"><i class="bi bi-ticket-perforated"></i> Tickets</h4><p class="text-muted mb-0">Tickets des patients créés par la réception.</p></div>
    </div>
    <div class="card">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead><tr><th>Date</th><th>Patient</th><th>Dossier</th><th>Médecin</th><th>Type</th><th>Montant</th><th>État</th><th class="text-end">Action</th></tr></thead>
          <tbody>
            <tr *ngFor="let ticket of ticketsPage" [class.table-warning]="!ticket.lue">
              <td>{{ ticket.dateCreation | date:'dd/MM/yyyy HH:mm' }}</td>
              <td><strong>{{ ticket.patientPrenom }} {{ ticket.patientNom }}</strong></td>
              <td>{{ ticket.numeroDossier || '-' }}</td>
              <td>Dr {{ ticket.medecinPrenom || '-' }} {{ ticket.medecinNom || '' }}</td>
              <td>{{ ticket.type === 'PATIENT_RENDEZVOUS' ? 'Rendez-vous' : 'Consultation' }}</td>
              <td>{{ ticket.montantConsultation || 5000 | number:'1.0-0' }} FCFA</td>
              <td>{{ ticket.lue ? 'Traité' : 'En attente' }}</td>
              <td class="text-end"><button class="btn btn-sm btn-outline-primary" (click)="ouvrir(ticket)" title="Ouvrir ou imprimer le ticket"><i class="bi bi-printer"></i></button></td>
            </tr>
            <tr *ngIf="tickets.length === 0"><td colspan="8" class="text-center text-muted py-4">Aucun ticket</td></tr>
          </tbody>
        </table>
      </div>
    </div>
    <app-pagination [page]="page" [totalPages]="totalPages" (pageChange)="page = $event"></app-pagination>
  `
})
export class TicketListComponent implements OnInit {
  tickets: Notification[] = [];
  page = 1;
  readonly pageSize = 10;

  constructor(private notificationService: NotificationService, private router: Router) {}

  ngOnInit(): void {
    this.notificationService.findAll().subscribe((notifications) => {
      this.tickets = notifications.filter((ticket) => ticket.type === 'PATIENT_CONSULTATION' || ticket.type === 'PATIENT_RENDEZVOUS');
      this.page = 1;
    });
  }

  get totalPages(): number { return Math.max(1, Math.ceil(this.tickets.length / this.pageSize)); }
  get ticketsPage(): Notification[] {
    const start = (this.page - 1) * this.pageSize;
    return this.tickets.slice(start, start + this.pageSize);
  }

  ouvrir(ticket: Notification): void {
    this.notificationService.marquerLue(ticket.id).subscribe(() => {
      if (ticket.consultationId) {
        this.router.navigate(['/consultations', ticket.consultationId, 'ticket']);
      } else {
        this.router.navigate(['/tickets', ticket.id]);
      }
    });
  }
}
