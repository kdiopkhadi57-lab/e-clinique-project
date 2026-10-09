import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Consultation } from '../../../core/models/consultation.model';
import { ConsultationService } from '../../../core/services/consultation.service';

@Component({
  selector: 'app-consultation-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="no-print d-flex justify-content-between align-items-center mb-3">
      <h4 class="mb-0">Consultation</h4>
      <div class="d-flex gap-2">
        <button type="button" class="btn btn-primary" (click)="ouvrirTicket()"><i class="bi bi-ticket-perforated"></i> Ticket</button>
        <button type="button" class="btn btn-outline-primary" (click)="imprimer()"><i class="bi bi-printer"></i> Imprimer la consultation</button>
      </div>
    </div>

    <div *ngIf="chargement" class="alert alert-info no-print">Chargement de la consultation...</div>
    <div *ngIf="erreur" class="alert alert-danger no-print">{{ erreur }}</div>

    <article *ngIf="consultation && !chargement" class="consultation-sheet invoice-page">
      <header class="invoice-header">
        <div class="clinic-header" aria-label="CABINET MEDICAL DEMBA BODIEL SY">
          <img class="clinic-logo" src="assets/logo-embleme.png" alt="Logo Cabinet Médical Demba Bodiel SY">
          <div class="clinic-name">CABINET MEDICAL DEMBA BODIEL SY</div>
          <div class="clinic-address">Darou Khoudoss route de Mboro</div>
          <div class="clinic-authorization">Aut N° : 3682 du 30/03/15</div>
          <div class="clinic-phone">Tel : 77 519 35 11 / 76 353 48 42</div>
        </div>
      </header>

      <div class="document-title">CONSULTATION</div>

      <div class="bill-top">
        <div class="bill-box">
          <div class="section-label">Patient</div>
          <div class="bill-name">{{ consultation.patient?.prenom }} {{ consultation.patient?.nom }}</div>
          <div>Dossier n° {{ consultation.patient?.numeroDossier || '-' }}</div>
          <div>Téléphone : {{ consultation.patient?.telephone || '-' }}</div>
          <div>Email : {{ consultation.patient?.email || 'Non renseigné' }}</div>
        </div>

        <div class="bill-box details-box">
          <div class="section-label">Détails de la consultation</div>
          <div><span>Date :</span> {{ consultation.dateConsultation | date:'dd MMMM yyyy HH:mm' }}</div>
          <div><span>Type :</span> {{ consultation.type === 'SPECIALISEE' ? 'Spécialisée' : 'Générale' }}</div>
          <div><span>Médecin :</span> Dr. {{ consultation.medecin?.prenom }} {{ consultation.medecin?.nom }}</div>
          <div><span>Motif :</span> {{ consultation.motif || '-' }}</div>
        </div>
      </div>

      <section class="clinical-section">
        <div class="section-title">Motif et examen clinique</div>
        <div class="detail-row"><strong>Motif :</strong><span>{{ consultation.motif || '-' }}</span></div>
        <div class="detail-row"><strong>Symptômes :</strong><span>{{ consultation.symptomes || '-' }}</span></div>
        <div class="detail-row"><strong>Diagnostic :</strong><span>{{ consultation.diagnostic || '-' }}</span></div>
        <div class="detail-row"><strong>Observations :</strong><span>{{ consultation.observations || '-' }}</span></div>
      </section>

      <section class="clinical-section" *ngIf="aDesConstantes()">
        <div class="section-title">Constantes</div>
        <div class="constants-grid">
          <div>Température : <strong>{{ consultation.temperature ?? '-' }} °C</strong></div>
          <div>Tension : <strong>{{ consultation.tensionArterielle_systolique ?? '-' }}/{{ consultation.tensionArterielle_diastolique ?? '-' }}</strong></div>
          <div>Poids : <strong>{{ consultation.poids ?? '-' }} kg</strong></div>
          <div>Taille : <strong>{{ consultation.taille ?? '-' }} cm</strong></div>
        </div>
      </section>

      <section class="clinical-section" *ngIf="consultation.prescriptions?.length">
        <div class="section-title">Prescriptions médicales</div>
        <table>
          <thead>
            <tr><th>Médicament</th><th>Quantité</th><th>Posologie</th><th>Durée</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let ligne of consultation.prescriptions">
              <td>{{ ligne.medicament?.nom || '-' }}<span *ngIf="ligne.medicament?.forme"> ({{ ligne.medicament.forme }})</span></td>
              <td>{{ ligne.quantite }}</td>
              <td>{{ ligne.posologie || '-' }}</td>
              <td>{{ ligne.dureeTraitement || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <footer class="sheet-footer">
        <div class="signature-block">Signature et cachet du médecin</div>
        <div class="clinic-footer">
          <div>Darou Khoudoss route de Mboro</div>
          <div>Tel : 77 519 35 11 / 76 353 48 42</div>
        </div>
      </footer>
    </article>
  `,
  styles: [`
    .consultation-sheet {
      max-width: 1000px;
      margin: 0 auto;
      padding: 0 0 28px;
      font-family: 'Segoe UI', Arial, sans-serif;
      background: #f3f3f3;
      border: 2px solid #2f7d5a;
      color: #1d1d1d;
    }

    .invoice-header {
      padding: 14px 24px 8px;
      text-align: center;
      background: #f3f3f3;
    }

    .clinic-logo { display: block; height: 72px; margin: 0 auto 6px; }

    .clinic-header {
      color: #111;
      font-family: Georgia, 'Times New Roman', serif;
      line-height: 1.05;
    }

    .clinic-name {
      font-family: Arial, sans-serif;
      font-size: clamp(1.3rem, 3vw, 2.5rem);
      font-weight: 900;
      letter-spacing: 0.02em;
    }

    .clinic-address,
    .clinic-authorization,
    .clinic-phone {
      font-size: clamp(0.95rem, 2vw, 1.35rem);
      font-style: italic;
      margin-top: 3px;
    }

    .document-title {
      padding: 5px 24px 10px;
      border-bottom: 3px solid #2f7d5a;
      color: #1c1c1c;
      font-size: 1.5rem;
      font-weight: 800;
      text-align: center;
    }

    .bill-top {
      display: grid;
      grid-template-columns: 1.35fr 0.95fr;
      border-bottom: 3px solid #2f7d5a;
    }

    .bill-box {
      padding: 10px 18px 8px;
      font-size: 0.94rem;
      line-height: 1.35;
    }

    .bill-box + .bill-box {
      border-left: 3px solid #2f7d5a;
    }

    .section-label {
      display: block;
      margin-bottom: 5px;
      font-size: 1.35rem;
      font-weight: 800;
      color: #1d1d1d;
    }

    .bill-name {
      font-size: 1.12rem;
      font-weight: 600;
      margin-bottom: 2px;
    }

    .details-box {
      font-weight: 500;
    }

    .details-box div {
      margin-bottom: 3px;
    }

    .details-box span {
      font-weight: 800;
    }

    .clinical-section {
      padding: 12px 18px;
      border-bottom: 1px solid rgba(47, 125, 90, 0.8);
      background: #fff;
    }

    .section-title {
      margin-bottom: 8px;
      color: #087f5b;
      font-size: 1.05rem;
      font-weight: 800;
    }

    .detail-row {
      display: grid;
      grid-template-columns: 140px 1fr;
      gap: 10px;
      margin: 6px 0;
      line-height: 1.4;
    }

    .constants-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      background: #fff;
    }

    th, td {
      padding: 8px 10px;
      border: 1px solid #777;
      text-align: left;
    }

    th {
      background: #2f7d5a;
      color: #fff;
      font-weight: 700;
    }

    .sheet-footer {
      padding: 18px 18px 0;
      border-top: 2px solid #2f7d5a;
      text-align: center;
      font-weight: 700;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 16px;
    }

    .signature-block {
      min-width: 220px;
      text-align: center;
      padding-bottom: 12px;
    }

    .clinic-footer {
      margin-top: 0;
      padding-top: 8px;
      color: #4b4b4b;
      font-size: 0.8rem;
      line-height: 1.3;
      text-align: left;
      border-top: 2px solid #2f7d5a;
      min-width: 220px;
    }

    @media (max-width: 700px) {
      .bill-top, .constants-grid { grid-template-columns: 1fr; gap: 10px; }
      .detail-row { grid-template-columns: 1fr; gap: 2px; }
      .consultation-sheet { padding: 0 0 20px; }
      .sheet-footer { flex-direction: column; align-items: stretch; }
      .signature-block, .clinic-footer { min-width: 0; }
      table { display: block; overflow-x: auto; font-size: .85rem; }
    }

    @media print {
      .no-print { display: none !important; }
      .consultation-sheet { max-width: none; border: none; padding: 8mm 10mm; page-break-inside: avoid; }
      body { background: #fff; }
    }
  `]
})
export class ConsultationDetailComponent implements OnInit {
  consultation: Consultation | null = null;
  chargement = true;
  erreur = '';

  constructor(
    private route: ActivatedRoute,
    private consultationService: ConsultationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.consultationService.findById(id).subscribe({
      next: (consultation) => {
        this.consultation = consultation;
        this.chargement = false;
      },
      error: () => {
        this.erreur = 'Impossible de charger cette consultation.';
        this.chargement = false;
      }
    });
  }

  aDesConstantes(): boolean {
    if (!this.consultation) return false;
    return this.consultation.temperature != null ||
      this.consultation.tensionArterielle_systolique != null ||
      this.consultation.tensionArterielle_diastolique != null ||
      this.consultation.poids != null ||
      this.consultation.taille != null;
  }

  imprimer(): void {
    window.print();
  }

  ouvrirTicket(): void {
    if (this.consultation?.id) this.router.navigate(['/consultations', this.consultation.id, 'ticket']);
  }
}
