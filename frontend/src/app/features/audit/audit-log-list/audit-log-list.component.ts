import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditLog, PageResponse, TypeActionAudit } from '../../../core/models/audit-log.model';
import { AuditLogService } from '../../../core/services/audit-log.service';

@Component({
  selector: 'app-audit-log-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h4 class="mb-3"><i class="bi bi-shield-lock"></i> Journal d'audit</h4>

    <div class="card p-3 mb-3">
      <div class="row g-2 align-items-end">
        <div class="col-md-3">
          <label class="form-label">Utilisateur</label>
          <input class="form-control" [(ngModel)]="filtres.utilisateur" placeholder="nom d'utilisateur">
        </div>
        <div class="col-md-2">
          <label class="form-label">Entité</label>
          <select class="form-select" [(ngModel)]="filtres.entite">
            <option value="">Toutes</option>
            <option *ngFor="let e of entites" [value]="e">{{ e }}</option>
          </select>
        </div>
        <div class="col-md-2">
          <label class="form-label">Action</label>
          <select class="form-select" [(ngModel)]="filtres.action">
            <option value="">Toutes</option>
            <option *ngFor="let a of actions" [value]="a">{{ traduireAction(a) }}</option>
          </select>
        </div>
        <div class="col-md-2">
          <label class="form-label">Depuis</label>
          <input type="datetime-local" class="form-control" [(ngModel)]="filtres.debut">
        </div>
        <div class="col-md-2">
          <label class="form-label">Jusqu'à</label>
          <input type="datetime-local" class="form-control" [(ngModel)]="filtres.fin">
        </div>
        <div class="col-md-1">
          <button class="btn btn-primary w-100" (click)="rechercher(0)">
            <i class="bi bi-search"></i>
          </button>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead>
            <tr>
              <th>Date</th>
              <th>Utilisateur</th>
              <th>Action</th>
              <th>Entité</th>
              <th>ID</th>
              <th>Description</th>
              <th>IP</th>
              <th>Résultat</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let log of page?.content" [class.table-danger]="!log.succes">
              <td class="text-nowrap">{{ log.dateAction | date:'dd/MM/yyyy HH:mm:ss' }}</td>
              <td>{{ log.utilisateurUsername }}</td>
              <td>
                <span class="badge" [ngClass]="badgeClasse(log.action)">{{ traduireAction(log.action) }}</span>
              </td>
              <td>{{ log.entite }}</td>
              <td>{{ log.entiteId || '-' }}</td>
              <td class="small">{{ log.description || '-' }}</td>
              <td class="small text-muted">{{ log.adresseIp || '-' }}</td>
              <td>
                <span class="badge" [ngClass]="log.succes ? 'bg-success' : 'bg-danger'">
                  {{ log.succes ? 'OK' : 'Échec' }}
                </span>
              </td>
            </tr>
            <tr *ngIf="page?.content?.length === 0">
              <td colspan="8" class="text-center text-muted py-4">Aucune entrée trouvée</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <nav class="mt-3" *ngIf="page && page.totalPages > 1">
      <ul class="pagination justify-content-center">
        <li class="page-item" [class.disabled]="page.number === 0">
          <button class="page-link" (click)="rechercher(page.number - 1)">Précédent</button>
        </li>
        <li class="page-item disabled">
          <span class="page-link">Page {{ page.number + 1 }} / {{ page.totalPages }}</span>
        </li>
        <li class="page-item" [class.disabled]="page.number + 1 >= page.totalPages">
          <button class="page-link" (click)="rechercher(page.number + 1)">Suivant</button>
        </li>
      </ul>
    </nav>
  `
})
export class AuditLogListComponent implements OnInit {
  page: PageResponse<AuditLog> | null = null;
  entites: string[] = [];
  actions: TypeActionAudit[] = [];

  filtres: { utilisateur: string; entite: string; action: string; debut: string; fin: string } = {
    utilisateur: '',
    entite: '',
    action: '',
    debut: '',
    fin: ''
  };

  constructor(private auditLogService: AuditLogService) {}

  ngOnInit(): void {
    this.auditLogService.entitesDisponibles().subscribe((e) => (this.entites = e));
    this.auditLogService.actionsDisponibles().subscribe((a) => (this.actions = a));
    this.rechercher(0);
  }

  rechercher(page: number): void {
    if (page < 0) return;
    this.auditLogService
      .rechercher({
        utilisateur: this.filtres.utilisateur || undefined,
        entite: this.filtres.entite || undefined,
        action: (this.filtres.action || undefined) as TypeActionAudit | undefined,
        debut: this.filtres.debut || undefined,
        fin: this.filtres.fin || undefined,
        page,
        taille: 20
      })
      .subscribe((res) => (this.page = res));
  }

  traduireAction(action: TypeActionAudit): string {
    const map: Record<string, string> = {
      CREATION: 'Création',
      MODIFICATION: 'Modification',
      SUPPRESSION: 'Suppression',
      CONSULTATION_DOSSIER: 'Consultation dossier',
      MOUVEMENT_STOCK: 'Mouvement stock',
      PAIEMENT: 'Paiement',
      ANNULATION: 'Annulation',
      CONNEXION: 'Connexion',
      ECHEC_CONNEXION: 'Échec connexion',
      DECONNEXION: 'Déconnexion',
      AUTRE: 'Autre'
    };
    return map[action] || action;
  }

  badgeClasse(action: TypeActionAudit): string {
    const map: Record<string, string> = {
      CREATION: 'bg-success',
      MODIFICATION: 'bg-info',
      SUPPRESSION: 'bg-danger',
      CONSULTATION_DOSSIER: 'bg-secondary',
      MOUVEMENT_STOCK: 'bg-warning text-dark',
      PAIEMENT: 'bg-primary',
      ANNULATION: 'bg-danger',
      CONNEXION: 'bg-success',
      ECHEC_CONNEXION: 'bg-danger',
      DECONNEXION: 'bg-secondary',
      AUTRE: 'bg-secondary'
    };
    return map[action] || 'bg-secondary';
  }
}
