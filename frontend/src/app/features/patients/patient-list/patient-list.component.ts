import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Patient } from '../../../core/models/patient.model';
import { PatientImportResult, PatientService } from '../../../core/services/patient.service';
import { AuthService } from '../../../core/services/auth.service';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PaginationComponent],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4><i class="bi bi-people"></i> Patients</h4>
      <div class="d-flex gap-2" *ngIf="auth.hasRole('ADMIN','RECEPTIONNISTE','MEDECIN','INFIRMIER')">
        <input #fichierInput type="file" class="d-none" accept=".xlsx,.xls,.docx"
               (change)="importer($event)">
        <button type="button" class="btn btn-outline-primary" (click)="fichierInput.click()" [disabled]="importEnCours">
          <i class="bi bi-upload"></i> {{ importEnCours ? 'Import...' : 'Importer' }}
        </button>
        <a routerLink="/patients/nouveau" class="btn btn-primary">
          <i class="bi bi-plus-lg"></i> Nouveau patient
        </a>
      </div>
    </div>

    <div class="alert alert-success" *ngIf="importResult">
      Import termine : {{ importResult.importes }} patient(s) ajoute(s), {{ importResult.ignores }} doublon(s) ignore(s).
      <ul class="mb-0 mt-2" *ngIf="importResult.erreurs.length">
        <li *ngFor="let erreur of importResult.erreurs">{{ erreur }}</li>
      </ul>
    </div>
    <div class="alert alert-danger" *ngIf="importErreur">{{ importErreur }}</div>

    <div class="input-group mb-3" style="max-width: 400px;">
      <span class="input-group-text"><i class="bi bi-search"></i></span>
      <input type="text" class="form-control" placeholder="Rechercher un patient..."
             [(ngModel)]="recherche" (ngModelChange)="rechercher()">
    </div>

    <div class="alert alert-danger" *ngIf="erreurSuppression">{{ erreurSuppression }}</div>
    <div class="alert alert-success" *ngIf="messageSuppression">{{ messageSuppression }}</div>

    <div class="card">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead>
            <tr>
              <th>N° Dossier</th>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Téléphone</th>
              <th>Sexe</th>
              <th>Groupe sanguin</th>
              <th>Assureur / IPM</th>
              <th>Créé le</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of patientsPage">
              <td>{{ p.numeroDossier }}</td>
              <td>{{ p.nom }}</td>
              <td>{{ p.prenom }}</td>
              <td>{{ p.telephone || '-' }}</td>
              <td>{{ p.sexe || '-' }}</td>
              <td>{{ p.groupeSanguin || '-' }}</td>
              <td>{{ p.organisme?.nom || 'Comptant' }}</td>
              <td class="text-nowrap">{{ p.dateCreation ? (p.dateCreation | date:'dd/MM/yyyy') : '-' }}</td>
              <td class="text-end text-nowrap">
                <a [routerLink]="['/patients', p.id]" class="btn btn-sm btn-outline-primary me-1" title="Dossier">
                  <i class="bi bi-eye"></i>
                </a>
                <a [routerLink]="['/patients', p.id, 'modifier']" class="btn btn-sm btn-outline-secondary" title="Modifier">
                  <i class="bi bi-pencil"></i>
                </a>
                <button type="button" *ngIf="auth.hasRole('ADMIN')" class="btn btn-sm btn-outline-danger ms-1"
                        title="Supprimer" (click)="supprimer(p)">
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
            <tr *ngIf="patients.length === 0">
              <td colspan="9" class="text-center text-muted py-4">Aucun patient trouvé</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <app-pagination [page]="page" [totalPages]="totalPages" (pageChange)="page = $event"></app-pagination>
  `
})
export class PatientListComponent implements OnInit {
  patients: Patient[] = [];
  recherche = '';
  importEnCours = false;
  importResult?: PatientImportResult;
  importErreur = '';
  page = 1;
  readonly pageSize = 10;

  erreurSuppression = '';
  messageSuppression = '';

  constructor(private patientService: PatientService, public auth: AuthService) {}

  supprimer(p: Patient): void {
    if (!confirm(`Supprimer définitivement ${p.prenom} ${p.nom} (${p.numeroDossier}) ?\n`
      + 'Ses consultations, rendez-vous et factures non payées seront aussi supprimés.')) return;
    this.erreurSuppression = '';
    this.messageSuppression = '';
    this.patientService.delete(p.id!).subscribe({
      next: () => {
        this.patients = this.patients.filter((x) => x.id !== p.id);
        this.messageSuppression = `${p.prenom} ${p.nom} a été supprimé.`;
      },
      error: (err) => (this.erreurSuppression = err.error?.message || 'La suppression a échoué.')
    });
  }

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.patientService.findAll().subscribe((data) => { this.patients = data; this.page = 1; });
  }

  rechercher(): void {
    this.patientService.findAll(this.recherche).subscribe((data) => { this.patients = data; this.page = 1; });
  }

  get totalPages(): number { return Math.max(1, Math.ceil(this.patients.length / this.pageSize)); }
  get patientsPage(): Patient[] {
    const start = (this.page - 1) * this.pageSize;
    return this.patients.slice(start, start + this.pageSize);
  }

  importer(event: Event): void {
    const input = event.target as HTMLInputElement;
    const fichier = input.files?.[0];
    input.value = '';
    if (!fichier) return;

    this.importEnCours = true;
    this.importResult = undefined;
    this.importErreur = '';
    this.patientService.importer(fichier).subscribe({
      next: (resultat) => {
        this.importResult = resultat;
        this.importEnCours = false;
        this.charger();
      },
      error: (erreur) => {
        this.importErreur = erreur.error?.message || 'L import du fichier a echoue.';
        this.importEnCours = false;
      }
    });
  }
}
