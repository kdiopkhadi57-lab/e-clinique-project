import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Consultation } from '../../../core/models/consultation.model';
import { ConsultationService } from '../../../core/services/consultation.service';

@Component({
  selector: 'app-consultation-ticket',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ticket-actions no-print">
      <button type="button" class="btn btn-primary" (click)="imprimer()">
        <i class="bi bi-printer"></i> Imprimer le ticket
      </button>
    </div>

    <div *ngIf="chargement" class="alert alert-info no-print">Chargement du ticket...</div>
    <div *ngIf="erreur" class="alert alert-danger no-print">{{ erreur }}</div>

    <article *ngIf="consultation" class="ticket">
      <div class="clinic-header">
        <img class="clinic-logo" src="assets/logo-embleme.png" alt="Logo Cabinet Médical Demba Bodiel SY">
        <div class="clinic-name">CABINET MEDICAL DEMBA BODIEL SY</div>
        <div>BP 1234, Dakar - Tél : +221 33 000 00 00</div>
        <div>NIF : 001234567 | RCCM : SN DKR...</div>
      </div>

      <div class="rule"></div>
      <div class="document-title">TICKET DE CAISSE / CONSULTATION</div>
      <div class="ticket-lines">
        <div class="line"><span>N° Ticket</span><strong>{{ numeroTicket() }}</strong></div>
        <div class="line"><span>Date / Heure</span><strong>{{ consultation.dateConsultation | date:'dd/MM/yyyy à HH:mm' }}</strong></div>
        <div class="line"><span>Caissetier(e)</span><strong>Fatou D.</strong></div>
      </div>

      <div class="rule"></div>
      <div class="section-title">PATIENT :</div>
      <div class="ticket-lines">
        <div class="line"><span>Code / Dossier</span><strong>{{ codePatient() }}</strong></div>
        <div class="line"><span>Nom &amp; Prénom</span><strong>{{ consultation.patient?.prenom }} {{ consultation.patient?.nom }}</strong></div>
        <div class="line"><span>Âge / Sexe</span><strong>{{ age() }} ans / {{ sexe() }}</strong></div>
      </div>

      <div class="rule"></div>
      <div class="section-title">PRESTATION / SERVICE :</div>
      <div class="prestations">
        <div class="prestation"><span>[TRI] {{ service() }}</span><strong>1 500 CFA</strong></div>
        <div class="prestation"><span>Consultation Généraliste</span><strong>5 000 CFA</strong></div>
      </div>
      <div class="amount-line total-line"><span>TOTAL À PAYER</span><strong>{{ afficherMontant(total()) }}</strong></div>

      <div class="rule"></div>
      <div class="section-title">MODE DE PAIEMENT :</div>
      <div class="ticket-lines">
        <div class="line"><span>Espèces</span><strong>{{ afficherMontant(total()) }}</strong></div>
        <div class="line"><span>Reçu / Payé</span><strong>OUI</strong></div>
      </div>
      <div class="rule"></div>
      <div class="section-title">ORIENTATION :</div>
      <div class="line orientation"><span>Service</span><strong>Salle d'attente 02 - Bureau Dr {{ consultation.medecin?.nom || 'Sow' }}</strong></div>
      <div class="rule"></div>
      <div class="footer-note">Merci de votre confiance !<br>Conservez ce ticket pour l'appel.</div>
    </article>
  `,
  styles: [`
    .ticket-actions { display: flex; justify-content: flex-end; max-width: 620px; margin: 0 auto 16px; }
    .ticket { width: min(100%, 620px); margin: 0 auto; padding: 24px 28px; border: 1px solid #222; color: #111; background: #fff; }
    .clinic-logo { display: block; height: 56px; margin: 0 auto 4px; }
    .clinic-header { text-align: center; margin-bottom: 8px; color: #111; font-size: .8rem; line-height: 1.25; }
    .clinic-name { font-size: 1.35rem; font-weight: 900; letter-spacing: 0.03em; }
    .document-title, .section-title { font-weight: 800; text-align: center; }
    .document-title { font-size: 1.1rem; margin: 8px 0; }
    .section-title { font-size: .9rem; margin: 8px 0 5px; }
    .ticket-lines { display: grid; gap: 4px; font-size: .82rem; }
    .line, .amount-line, .prestation { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
    .line span, .amount-line span { font-weight: 700; }
    .line strong, .amount-line strong, .prestation strong { text-align: right; }
    .rule { border-top: 1px dashed #111; margin: 8px 0; }
    .prestations { display: grid; gap: 4px; font-size: .82rem; }
    .amount-line { margin-top: 5px; font-size: .84rem; }
    .total-line { font-size: .95rem; font-weight: 900; margin-top: 8px; }
    .orientation { font-size: .82rem; }
    .footer-note { margin-top: 8px; text-align: center; font-weight: 800; font-size: .78rem; }
    @media print {
      @page { size: 80mm auto; margin: 0; }
      html, body { width: 80mm; margin: 0; padding: 0; background: #fff; }
      .no-print { display: none !important; }
      .ticket { box-sizing: border-box; width: 80mm; min-height: 0; margin: 0; padding: 4mm; border: 0; }
      .clinic-header { margin-bottom: 4px; }
      .clinic-name { font-size: 15px; }
      .clinic-header, .ticket-lines, .line, .amount-line, .prestation { font-size: 9px; }
      .document-title { font-size: 12px; margin: 5px 0; }
      .section-title { font-size: 10px; margin: 5px 0 3px; }
      .ticket-lines { gap: 3px; }
      .rule { margin: 5px 0; }
      .prestations { font-size: 9px; }
      .amount-line { margin-top: 3px; }
      .total-line { font-size: 10px; margin-top: 5px; }
      .orientation { font-size: 9px; }
      .footer-note { margin-top: 8px; }
    }
  `]
})
export class ConsultationTicketComponent implements OnInit {
  consultation: Consultation | null = null;
  chargement = true;
  erreur = '';

  constructor(private route: ActivatedRoute, private consultationService: ConsultationService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.consultationService.findById(id).subscribe({
      next: (consultation) => { this.consultation = consultation; this.chargement = false; },
      error: () => { this.erreur = 'Impossible de charger le ticket.'; this.chargement = false; }
    });
  }

  numeroTicket(): string {
    const date = this.consultation?.dateConsultation ? new Date(this.consultation.dateConsultation) : new Date();
    const dateCode = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    return `TCK-${dateCode}-${String(this.consultation?.id || 0).padStart(3, '0')}`;
  }

  afficherMontant(value: number): string {
    return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value || 0)} FCFA`;
  }

  prixUnitaire(): number {
    return 5000;
  }

  total(): number {
    return 1500 + this.prixUnitaire();
  }

  montantRecu(): number {
    return this.total();
  }

  monnaieRendue(): number {
    return Math.max(this.montantRecu() - this.total(), 0);
  }

  service(): string {
    return this.consultation?.type === 'SPECIALISEE' ? 'Médecine Spécialisée' : 'Médecine Générale';
  }

  codePatient(): string {
    return this.consultation?.patient?.numeroDossier || `PAT-${String(this.consultation?.patient?.id || 0).padStart(5, '0')}`;
  }

  age(): number | string {
    const dateNaissance = this.consultation?.patient?.dateNaissance;
    if (!dateNaissance) return '-';
    const naissance = new Date(dateNaissance);
    const aujourdHui = new Date();
    let age = aujourdHui.getFullYear() - naissance.getFullYear();
    const anniversairePasse = aujourdHui.getMonth() > naissance.getMonth() ||
      (aujourdHui.getMonth() === naissance.getMonth() && aujourdHui.getDate() >= naissance.getDate());
    if (!anniversairePasse) age--;
    return age;
  }

  sexe(): string {
    return this.consultation?.patient?.sexe === 'FEMME' ? 'F' : this.consultation?.patient?.sexe === 'HOMME' ? 'M' : '-';
  }

  imprimer(): void { window.print(); }
}
