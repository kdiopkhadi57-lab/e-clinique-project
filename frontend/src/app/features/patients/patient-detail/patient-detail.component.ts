import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Patient } from '../../../core/models/patient.model';
import { Consultation } from '../../../core/models/consultation.model';
import { PatientService } from '../../../core/services/patient.service';
import { ConsultationService } from '../../../core/services/consultation.service';
import { DocumentService } from '../../../core/services/document.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div *ngIf="patient">
      <div class="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h4>{{ patient.prenom }} {{ patient.nom }}</h4>
          <span class="text-muted">Dossier n° {{ patient.numeroDossier }}</span>
        </div>
        <div class="d-flex gap-2 no-print">
          <button class="btn btn-outline-primary" (click)="imprimerRapport()">
            <i class="bi bi-printer"></i> Imprimer le rapport médical
          </button>
          <a class="btn btn-primary" *ngIf="auth.hasRole('ADMIN','MEDECIN')" [routerLink]="['/consultations/nouvelle', patient.id]">
            <i class="bi bi-plus-lg"></i> Nouvelle consultation
          </a>
          <button class="btn btn-outline-danger" *ngIf="auth.hasRole('ADMIN')" (click)="supprimer()">
            <i class="bi bi-trash"></i> Supprimer
          </button>
        </div>
      </div>
      <div class="alert alert-danger no-print" *ngIf="erreurSuppression">{{ erreurSuppression }}</div>

      <div class="row g-3 mb-4">
        <div class="col-lg-4 col-md-6">
          <div class="card p-3 h-100">
            <h6 class="text-primary">Informations générales</h6>
            <p class="mb-1"><strong>Dossier créé le :</strong> {{ patient.dateCreation ? (patient.dateCreation | date:'dd/MM/yyyy à HH:mm') : '-' }}</p>
            <p class="mb-1"><strong>Date de naissance :</strong> {{ patient.dateNaissance || '-' }}</p>
            <p class="mb-1"><strong>Sexe :</strong> {{ patient.sexe || '-' }}</p>
            <p class="mb-1"><strong>Groupe sanguin :</strong> {{ patient.groupeSanguin || '-' }}</p>
            <p class="mb-1"><strong>Téléphone :</strong> {{ patient.telephone || '-' }}</p>
            <p class="mb-1"><strong>Email :</strong> {{ patient.email || '-' }}</p>
            <p class="mb-0"><strong>Adresse :</strong> {{ patient.adresse || '-' }}</p>
          </div>
        </div>
        <div class="col-lg-4 col-md-6">
          <div class="card p-3 h-100">
            <h6 class="text-primary">Prise en charge</h6>
            <ng-container *ngIf="patient.organisme as o; else comptant">
              <p class="mb-1"><strong>Assureur / IPM :</strong> {{ o.nom }}
                <span class="badge ms-1" [class.bg-primary]="o.type === 'ASSURANCE'" [class.bg-info]="o.type === 'IPM'">
                  {{ o.type === 'IPM' ? 'IPM' : 'Assurance' }}</span></p>
              <p class="mb-1"><strong>Taux de prise en charge :</strong> {{ patient.tauxPriseEnCharge ?? o.tauxPriseEnCharge }} %
                <span class="text-muted small" *ngIf="patient.tauxPriseEnCharge != null">(taux propre au patient)</span></p>
              <p class="mb-1"><strong>Matricule :</strong> {{ patient.matriculeAssure || '-' }}</p>
              <p class="mb-0"><strong>Valable jusqu'au :</strong>
                {{ patient.dateFinCouverture ? (patient.dateFinCouverture | date:'dd/MM/yyyy') : 'sans limite' }}
                <span class="badge bg-danger ms-1" *ngIf="couvertureExpiree">Expirée</span>
                <span class="badge bg-secondary ms-1" *ngIf="!o.actif">Organisme inactif</span></p>
            </ng-container>
            <ng-template #comptant><p class="mb-0 text-muted">Aucun assureur — paiement comptant.</p></ng-template>
          </div>
        </div>
        <div class="col-lg-4 col-md-12">
          <div class="card p-3 h-100">
            <h6 class="text-primary">Informations médicales</h6>
            <p class="mb-1"><strong>Allergies :</strong> {{ patient.allergies || 'Aucune connue' }}</p>
            <p class="mb-0"><strong>Antécédents :</strong> {{ patient.antecedentsMedicaux || 'Aucun connu' }}</p>
          </div>
        </div>
      </div>

      <h5 class="mb-3"><i class="bi bi-journal-medical"></i> Historique des consultations</h5>

      <div class="card mb-3" *ngFor="let c of consultations">
        <div class="card-body">
          <div class="d-flex justify-content-between">
            <h6 class="card-title">{{ c.dateConsultation | date:'dd/MM/yyyy HH:mm' }}
              <span class="badge ms-2" [class.bg-info]="c.type === 'GENERALE'" [class.bg-warning]="c.type === 'SPECIALISEE'">
                {{ c.type === 'SPECIALISEE' ? 'Spécialisée' : 'Générale' }}
              </span>
            </h6>
            <span class="text-muted">Dr. {{ c.medecin?.prenom }} {{ c.medecin?.nom }}</span>
          </div>
          <p class="mb-1"><strong>Motif :</strong> {{ c.motif || '-' }}</p>
          <p class="mb-1"><strong>Diagnostic :</strong> {{ c.diagnostic || '-' }}</p>
          <p class="mb-1" *ngIf="c.symptomes"><strong>Symptômes :</strong> {{ c.symptomes }}</p>
          <p class="mb-1" *ngIf="c.observations"><strong>Observations :</strong> {{ c.observations }}</p>
          <div *ngIf="c.prescriptions?.length">
            <strong>Prescriptions :</strong>
            <ul class="mb-0">
              <li *ngFor="let p of c.prescriptions">
                {{ p.medicament?.nom }} — Qté {{ p.quantite }}
                <span *ngIf="p.posologie"> — {{ p.posologie }}</span>
              </li>
            </ul>
          </div>
          <div class="mt-3 no-print">
            <button type="button" class="btn btn-outline-primary btn-sm" (click)="imprimerOrdonnance(c)">
              <i class="bi bi-printer"></i> Imprimer la consultation
            </button>
          </div>
        </div>
      </div>
      <p class="text-muted" *ngIf="consultations.length === 0">Aucune consultation enregistrée pour ce patient.</p>

      <section class="ordonnance-print" *ngIf="ordonnance">
        <div class="ordonnance-header">
          <img class="ordonnance-logo" src="assets/logo-embleme.png" alt="Logo Cabinet Médical Demba Bodiel SY">
          <h2>CONSULTATION</h2>
          <p>CABINET MEDICAL DEMBA BODIEL SY</p>
        </div>
        <div class="ordonnance-infos">
          <p><strong>Patient :</strong> {{ patient?.prenom }} {{ patient?.nom }}</p>
          <p><strong>N° dossier :</strong> {{ patient?.numeroDossier || '-' }}</p>
          <p><strong>Date :</strong> {{ ordonnance.dateConsultation | date:'dd/MM/yyyy HH:mm' }}</p>
          <p><strong>Médecin :</strong> Dr. {{ ordonnance.medecin?.prenom }} {{ ordonnance.medecin?.nom }}</p>
          <p><strong>Type :</strong> {{ ordonnance.type === 'SPECIALISEE' ? 'Consultation spécialisée' : 'Consultation générale' }}</p>
        </div>
        <div class="consultation-details">
          <p><strong>Motif :</strong> {{ ordonnance.motif || '-' }}</p>
          <p><strong>Symptômes :</strong> {{ ordonnance.symptomes || '-' }}</p>
          <p><strong>Diagnostic :</strong> {{ ordonnance.diagnostic || '-' }}</p>
          <p><strong>Observations :</strong> {{ ordonnance.observations || '-' }}</p>
          <p *ngIf="ordonnance.temperature || ordonnance.tensionArterielle_systolique || ordonnance.poids || ordonnance.taille">
            <strong>Constantes :</strong>
            Température {{ ordonnance.temperature || '-' }} °C ·
            Tension {{ ordonnance.tensionArterielle_systolique || '-' }}/{{ ordonnance.tensionArterielle_diastolique || '-' }} ·
            Poids {{ ordonnance.poids || '-' }} kg · Taille {{ ordonnance.taille || '-' }} cm
          </p>
        </div>
        <h3 *ngIf="ordonnance.prescriptions?.length">Prescriptions médicales</h3>
        <table *ngIf="ordonnance.prescriptions?.length">
          <thead>
            <tr><th>Médicament / sirop</th><th>Quantité</th><th>Posologie</th><th>Durée</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let ligne of ordonnance.prescriptions">
              <td>{{ ligne.medicament?.nom || '-' }}<span *ngIf="ligne.medicament?.forme"> ({{ ligne.medicament?.forme }})</span></td>
              <td>{{ ligne.quantite }}</td>
              <td>{{ ligne.posologie || '-' }}</td>
              <td>{{ ligne.dureeTraitement || '-' }}</td>
            </tr>
          </tbody>
        </table>
        <div class="ordonnance-signature">Signature et cachet du médecin :</div>
      </section>
    </div>
  `,
  styles: [`
    .ordonnance-print { display: none; }
    @media print {
      body.impression-ordonnance * { visibility: hidden !important; }
      body.impression-ordonnance .ordonnance-print,
      body.impression-ordonnance .ordonnance-print * { visibility: visible !important; }
      body.impression-ordonnance .ordonnance-print { display: block; position: absolute; inset: 0; padding: 12mm 14mm; color: #111; background: #fff; font-family: Arial, sans-serif; font-size: 12px; }
      .ordonnance-logo { display: block; height: 60px; margin: 0 auto 4px; }
      .ordonnance-header { border-bottom: 2px solid #2f7d5a; text-align: center; }
      .ordonnance-header h2 { margin: 0; color: #111 !important; }
      .ordonnance-header p { margin: 3px 0 7px; color: #2f7d5a; font-weight: 700; }
      .ordonnance-infos { display: grid; grid-template-columns: 1fr 1fr; gap: 2px 18px; margin: 12px 0; }
      .ordonnance-infos p { margin: 0; }
      .ordonnance-print h3 { margin: 14px 0 6px; font-size: 15px; }
      .ordonnance-print table { width: 100%; border-collapse: collapse; }
      .ordonnance-print th, .ordonnance-print td { padding: 5px 6px; border: 1px solid #555; text-align: left; }
      .ordonnance-print th { background: #eef5f1; }
      .consultation-details p { margin: 0 0 4px; }
      .ordonnance-signature { margin-top: 42px; margin-left: 65%; border-top: 1px solid #555; padding-top: 5px; }
    }
  `]
})
export class PatientDetailComponent implements OnInit {
  patient: Patient | null = null;

  get couvertureExpiree(): boolean {
    const fin = this.patient?.dateFinCouverture;
    if (!fin) return false;
    const d = new Date();
    const aujourdhui = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return fin < aujourdhui;
  }
  consultations: Consultation[] = [];
  ordonnance: Consultation | null = null;

  constructor(
    private route: ActivatedRoute,
    private patientService: PatientService,
    private consultationService: ConsultationService,
    private documentService: DocumentService,
    public auth: AuthService,
    private router: Router
  ) {}

  erreurSuppression = '';

  supprimer(): void {
    const p = this.patient!;
    if (!confirm(`Supprimer définitivement ${p.prenom} ${p.nom} (${p.numeroDossier}) ?\n`
      + 'Ses consultations, rendez-vous et factures non payées seront aussi supprimés.')) return;
    this.patientService.delete(p.id!).subscribe({
      next: () => this.router.navigate(['/patients']),
      error: (err) => (this.erreurSuppression = err.error?.message || 'La suppression a échoué.')
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.patientService.findById(id).subscribe((p) => (this.patient = p));
    this.consultationService.findByPatient(id).subscribe((c) => (this.consultations = c));
  }

  imprimerRapport(): void {
    this.documentService.imprimerPage();
  }

  imprimerOrdonnance(consultation: Consultation): void {
    this.ordonnance = consultation;
    document.body.classList.add('impression-ordonnance');
    window.setTimeout(() => {
      window.print();
      document.body.classList.remove('impression-ordonnance');
      this.ordonnance = null;
    }, 0);
  }
}
