import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FactureOrganismeService } from '../../core/services/facture-organisme.service';
import { FactureOrganisme } from '../../core/models/organisme.model';
import { ModePaiement } from '../../core/models/facture.model';
import { AuthService } from '../../core/services/auth.service';
import { DocumentService } from '../../core/services/document.service';
import { EnvoiRequest, EnvoiService } from '../../core/services/envoi.service';
import { EnvoiEmailComponent } from '../../shared/envoi-email/envoi-email.component';

@Component({
  selector: 'app-facture-organisme-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, EnvoiEmailComponent],
  template: `
    <div class="alert alert-danger" *ngIf="erreur">{{ erreur }}</div>
    <ng-container *ngIf="facture">
      <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3 no-print">
        <div>
          <a routerLink="/factures-organismes" class="small"><i class="bi bi-arrow-left"></i> Retour</a>
          <h4 class="mb-0">Facture {{ facture.numero }}</h4>
          <span class="badge" [class.bg-warning]="facture.statut === 'EN_ATTENTE'" [class.text-dark]="facture.statut === 'EN_ATTENTE'"
                [class.bg-success]="facture.statut === 'PAYEE'" [class.bg-secondary]="facture.statut === 'ANNULEE'">{{ libelleStatut }}</span>
        </div>
        <div class="d-flex gap-2 flex-wrap align-items-center">
          <button class="btn btn-outline-primary" (click)="imprimer()"><i class="bi bi-printer"></i> Imprimer</button>
          <button class="btn btn-outline-primary" (click)="telechargerPdf()"><i class="bi bi-file-earmark-pdf"></i> PDF</button>
          <button class="btn btn-outline-primary" *ngIf="facture.statut !== 'ANNULEE'" (click)="envoiOuvert = !envoiOuvert">
            <i class="bi bi-envelope"></i> Envoyer à l'organisme</button>
          <ng-container *ngIf="facture.statut === 'EN_ATTENTE'">
            <select class="form-select w-auto" [(ngModel)]="modePaiement">
              <option value="VIREMENT">Virement</option>
              <option value="ASSURANCE">Règlement assurance</option>
              <option value="ESPECES">Espèces</option>
              <option value="MOBILE_MONEY">Mobile money</option>
              <option value="CARTE_BANCAIRE">Chèque / carte</option>
            </select>
            <button class="btn btn-success" (click)="payer()"><i class="bi bi-cash"></i> Marquer payée</button>
            <button class="btn btn-outline-danger" *ngIf="auth.hasRole('ADMIN')" (click)="annuler()"><i class="bi bi-x-lg"></i> Annuler</button>
          </ng-container>
        </div>
      </div>

      <div class="card p-3 mb-3 no-print" *ngIf="envoiOuvert">
        <h6 class="mb-2">Envoyer la facture {{ facture.numero }} par e-mail (PDF joint)</h6>
        <app-envoi-email [destinatairesParDefaut]="facture.organisme.email || ''" libelle="Envoyer la facture"
                         [placeholder]="facture.organisme.email ? '' : 'Aucune adresse enregistrée pour ' + facture.organisme.nom"
                         [enCours]="envoiEnCours" (envoyer)="envoyer($event)" (annuler)="envoiOuvert = false" />
      </div>
      <div class="alert alert-info py-2 no-print" *ngIf="facture.dateEnvoi">
        <i class="bi bi-envelope-check"></i> Envoyée le {{ facture.dateEnvoi | date:'dd/MM/yyyy à HH:mm' }} à {{ facture.envoyeA }}
      </div>
      <div class="alert alert-success py-2 no-print" *ngIf="messageEnvoi">{{ messageEnvoi }}</div>

      <div class="facture-org">
        <header class="entete">
          <img class="logo" src="assets/logo-embleme.png" alt="Logo Cabinet Médical Demba Bodiel SY">
          <div class="clinique">CABINET MEDICAL DEMBA BODIEL SY</div>
          <div class="italique">Darou Khoudoss route de Mboro</div>
          <div class="italique">Aut N° : 3682 du 30/03/15</div>
          <div class="italique">Tel : 77 519 35 11 / 76 353 48 42</div>
        </header>
        <div class="titre">FACTURE {{ facture.organisme.type === 'IPM' ? 'IPM' : 'ASSURANCE' }}</div>

        <div class="blocs">
          <div>
            <div class="label">Facturer à :</div>
            <div class="nom">{{ facture.organisme.nom }}</div>
            <div *ngIf="facture.organisme.contact">À l'attention de : {{ facture.organisme.contact }}</div>
            <div>{{ facture.organisme.adresse || 'Adresse non renseignée' }}</div>
            <div *ngIf="facture.organisme.telephone">Tél : {{ facture.organisme.telephone }}</div>
            <div *ngIf="facture.organisme.ninea">NINEA : {{ facture.organisme.ninea }}</div>
          </div>
          <div>
            <div class="label">Détails :</div>
            <div>Numéro : <strong>{{ facture.numero }}</strong></div>
            <div>Date d'émission : {{ facture.dateEmission | date:'dd/MM/yyyy' }}</div>
            <div>Période : {{ facture.periodeDebut | date:'dd/MM/yyyy' }} au {{ facture.periodeFin | date:'dd/MM/yyyy' }}</div>
            <div *ngIf="facture.statut === 'PAYEE'">Payée le {{ facture.datePaiement | date:'dd/MM/yyyy' }}</div>
          </div>
        </div>

        <table class="lignes">
          <thead><tr><th>#</th><th>Date</th><th>Patient / assuré</th><th>Matricule</th><th>Acte</th><th>Médecin</th>
            <th class="num">Montant</th><th class="num">Part patient</th><th class="num">À payer</th></tr></thead>
          <tbody>
            <tr *ngFor="let e of facture.lignes; let i = index">
              <td>{{ i + 1 }}</td>
              <td>{{ e.date | date:'dd/MM/yyyy' }}</td>
              <td>{{ e.patientNom }}<div class="petit">{{ e.numeroDossier }}</div></td>
              <td>{{ e.matriculeAssure || '-' }}</td>
              <td>{{ e.acte }}<div class="petit" *ngIf="e.reference">{{ e.reference }}</div></td>
              <td>{{ e.medecinNom || '-' }}</td>
              <td class="num">{{ e.montant | number:'1.0-0' }}</td>
              <td class="num">{{ e.partPatient | number:'1.0-0' }}</td>
              <td class="num"><strong>{{ e.partOrganisme | number:'1.0-0' }}</strong></td>
            </tr>
          </tbody>
          <tfoot>
            <tr><td colspan="6">Total ({{ facture.lignes.length }} prise(s) en charge)</td>
              <td class="num">{{ total('montant') | number:'1.0-0' }}</td>
              <td class="num">{{ total('partPatient') | number:'1.0-0' }}</td>
              <td class="num">{{ facture.montantTotal | number:'1.0-0' }} FCFA</td></tr>
          </tfoot>
        </table>

        <div class="arrete">Arrêtée la présente facture à la somme de <strong>{{ facture.montantTotal | number:'1.0-0' }} FCFA</strong>.</div>
        <div class="obs" *ngIf="facture.observations">Observations : {{ facture.observations }}</div>
        <div class="signature">La Direction</div>
      </div>
    </ng-container>
  `,
  styles: [`
    .facture-org { background: #fff; border: 2px solid #2f7d5a; padding: 0 0 24px; color: #1d1d1d; }
    .entete { text-align: center; padding: 14px 24px 8px; font-family: Georgia, 'Times New Roman', serif; }
    .logo { display: block; height: 72px; margin: 0 auto 6px; }
    .clinique { font-family: Arial, sans-serif; font-size: 1.9rem; font-weight: 900; letter-spacing: .02em; }
    .italique { font-style: italic; }
    .titre { text-align: center; font-size: 1.35rem; font-weight: 800; padding: 6px; border-top: 3px solid #2f7d5a; border-bottom: 3px solid #2f7d5a; }
    .blocs { display: grid; grid-template-columns: 1fr 1fr; border-bottom: 3px solid #2f7d5a; }
    .blocs > div { padding: 10px 18px; line-height: 1.4; }
    .blocs > div + div { border-left: 3px solid #2f7d5a; }
    .label { font-weight: 800; font-size: 1.05rem; margin-bottom: 4px; }
    .nom { font-weight: 700; font-size: 1.1rem; }
    .lignes { width: calc(100% - 36px); margin: 14px 18px; border-collapse: collapse; font-size: .88rem; }
    .lignes th, .lignes td { border: 1px solid #c9d8d0; padding: 5px 6px; vertical-align: top; }
    .lignes th { background: #eaf4ee; }
    .lignes tfoot td { font-weight: 700; background: #f6faf8; }
    .num { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
    .petit { font-size: .75rem; color: #666; }
    .arrete, .obs { margin: 0 18px 8px; }
    .signature { margin: 36px 48px 0 auto; width: 200px; text-align: center; font-weight: 700; border-top: 1px solid #999; padding-top: 6px; }
    @media (max-width: 700px) { .blocs { grid-template-columns: 1fr; } .blocs > div + div { border-left: 0; border-top: 3px solid #2f7d5a; } }
    @media (max-width: 575.98px) {
      .clinique { font-size: 1.35rem; }
      .lignes { display: block; width: auto; margin: 14px 12px; overflow-x: auto; font-size: .8rem; }
      .arrete, .obs { margin: 0 12px 8px; }
      .signature { margin: 28px auto 0; }
    }
    @media print { .facture-org { border-width: 1px; } .lignes { font-size: 10px; } }
  `]
})
export class FactureOrganismeDetailComponent implements OnInit {
  facture: FactureOrganisme | null = null;
  modePaiement: ModePaiement = 'VIREMENT';
  erreur = '';
  envoiOuvert = false;
  envoiEnCours = false;
  messageEnvoi = '';

  constructor(private route: ActivatedRoute, private service: FactureOrganismeService, public auth: AuthService,
              private documentService: DocumentService, private envoiService: EnvoiService) {}

  telechargerPdf(): void {
    this.documentService.factureOrganisme(this.facture!.id).subscribe({
      next: (blob) => this.documentService.telecharger(blob, `facture_${this.facture!.numero}.pdf`),
      error: () => (this.erreur = 'Impossible de générer le PDF')
    });
  }

  envoyer(req: EnvoiRequest): void {
    this.erreur = ''; this.messageEnvoi = ''; this.envoiEnCours = true;
    this.envoiService.factureOrganisme(this.facture!.id, req).subscribe({
      next: (f) => {
        this.facture = f; this.envoiEnCours = false; this.envoiOuvert = false;
        this.messageEnvoi = `Facture envoyée à ${f.envoyeA}.`;
      },
      error: (err) => { this.envoiEnCours = false; this.erreur = err.error?.message || 'Échec de l\'envoi'; }
    });
  }

  ngOnInit(): void { this.charger(); }

  charger(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.service.findById(id).subscribe({
      next: (f) => (this.facture = f),
      error: (err) => (this.erreur = err.error?.message || 'Facture introuvable')
    });
  }

  get libelleStatut(): string {
    const s = this.facture?.statut;
    return s === 'PAYEE' ? 'Payée' : s === 'ANNULEE' ? 'Annulée' : 'En attente de paiement';
  }

  total(champ: 'montant' | 'partPatient'): number {
    return (this.facture?.lignes || []).reduce((s, e) => s + e[champ], 0);
  }

  imprimer(): void { window.print(); }

  payer(): void {
    this.service.payer(this.facture!.id, this.modePaiement).subscribe({
      next: (f) => (this.facture = f),
      error: (err) => (this.erreur = err.error?.message || 'Erreur lors du paiement')
    });
  }

  annuler(): void {
    if (!confirm('Annuler cette facture ? Les prises en charge redeviendront facturables.')) return;
    this.service.annuler(this.facture!.id).subscribe({
      next: () => this.charger(),
      error: (err) => (this.erreur = err.error?.message || 'Erreur lors de l\'annulation')
    });
  }
}
