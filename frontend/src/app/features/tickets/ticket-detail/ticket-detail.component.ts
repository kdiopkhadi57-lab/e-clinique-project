import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Notification } from '../../../core/models/notification.model';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="no-print ticket-actions">
      <button type="button" class="btn btn-primary" (click)="imprimer()">
        <i class="bi bi-printer"></i> Imprimer le ticket
      </button>
    </div>
    <div *ngIf="chargement" class="alert alert-info no-print">Chargement du ticket...</div>
    <div *ngIf="erreur" class="alert alert-danger no-print">{{ erreur }}</div>

    <article *ngIf="ticket" class="ticket">
      <div class="clinic-header">
        <img class="clinic-logo" src="assets/logo-embleme.png" alt="Logo Cabinet Médical Demba Bodiel SY">
        <div class="clinic-name">CABINET MEDICAL DEMBA BODIEL SY</div>
        <div class="clinic-address">Darou Khoudoss route de Mboro</div>
        <div class="clinic-phone">Tel : 77 519 35 11 / 76 353 48 42</div>
      </div>

      <div class="rule"></div>
      <div class="document-title">TICKET DE CAISSE / CONSULTATION</div>

      <div class="ticket-lines">
        <div class="line"><span>N° Ticket</span><strong>{{ numeroTicket() }}</strong></div>
        <div class="line"><span>Date / Heure</span><strong>{{ ticket.dateCreation | date:'dd/MM/yyyy à HH:mm' }}</strong></div>
        <div class="line"><span>Caissetier(e)</span><strong>Réception</strong></div>
      </div>

      <div class="rule"></div>
      <div class="section-title">PATIENT :</div>
      <div class="ticket-lines">
        <div class="line"><span>Code / Dossier</span><strong>{{ ticket.numeroDossier || '-' }}</strong></div>
        <div class="line"><span>Nom &amp; Prénom</span><strong>{{ ticket.patientPrenom }} {{ ticket.patientNom }}</strong></div>
      </div>

      <div class="rule"></div>
      <div class="section-title">PRESTATION / SERVICE :</div>
      <div class="prestations">
        <div class="prestation"><span>{{ service() }}</span><strong>{{ montant() }} FCFA</strong></div>
      </div>
      <div class="amount-line total-line"><span>TOTAL À PAYER</span><strong>{{ montant() }} FCFA</strong></div>

      <div class="rule"></div>
      <div class="section-title">MODE DE PAIEMENT :</div>
      <div class="ticket-lines">
        <div class="line"><span>Espèces</span><strong>{{ montant() }} FCFA</strong></div>
        <div class="line"><span>Reçu / Payé</span><strong>{{ ticket.lue ? 'OUI' : 'EN ATTENTE' }}</strong></div>
      </div>
      <div class="rule"></div>
      <div class="section-title">ORIENTATION :</div>
      <div class="line orientation"><span>Service</span><strong>{{ medecin() }}</strong></div>
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
      .clinic-header { margin-bottom: 6px; }
      .clinic-name { font-size: 15px; }
      .clinic-address, .clinic-phone { font-size: 9px; }
      .document-title { font-size: 12px; margin: 5px 0; }
      .section-title { font-size: 10px; margin: 5px 0 3px; }
      .ticket-lines, .line, .prestation, .amount-line { font-size: 9px; }
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
export class TicketDetailComponent implements OnInit {
  ticket: Notification | null = null;
  chargement = true;
  erreur = '';

  constructor(private route: ActivatedRoute, private notificationService: NotificationService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.notificationService.findAll().subscribe({
      next: (tickets) => {
        this.ticket = tickets.find((item) => item.id === id) || null;
        this.chargement = false;
        if (!this.ticket) this.erreur = 'Ticket introuvable.';
        if (this.ticket && !this.ticket.lue) this.notificationService.marquerLue(this.ticket.id).subscribe();
      },
      error: () => { this.erreur = 'Impossible de charger le ticket.'; this.chargement = false; }
    });
  }

  numeroTicket(): string {
    const annee = this.ticket?.dateCreation ? new Date(this.ticket.dateCreation).getFullYear() : new Date().getFullYear();
    return `TCK-${annee}-${String(this.ticket?.id || 0).padStart(6, '0')}`;
  }

  numeroFile(): string { return String(this.ticket?.id || '-'); }
  medecin(): string { return this.ticket?.medecinPrenom || this.ticket?.medecinNom ? `Dr ${this.ticket.medecinPrenom || ''} ${this.ticket.medecinNom || ''}`.trim() : 'À confirmer'; }
  service(): string { return this.ticket?.typeConsultation === 'SPECIALISEE' ? 'Médecine spécialisée' : 'Médecine générale'; }
  motif(): string { return this.ticket?.type === 'PATIENT_RENDEZVOUS' ? 'Rendez-vous' : 'Consultation'; }
  montant(): string { return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(this.ticket?.montantConsultation || 5000); }
  imprimer(): void { window.print(); }
}
