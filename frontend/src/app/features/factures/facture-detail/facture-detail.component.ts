import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Facture, ModePaiement } from '../../../core/models/facture.model';
import { FactureService } from '../../../core/services/facture.service';
import { DocumentService } from '../../../core/services/document.service';
import { AuthService } from '../../../core/services/auth.service';
import { EnvoiRequest, EnvoiService } from '../../../core/services/envoi.service';
import { EnvoiEmailComponent } from '../../../shared/envoi-email/envoi-email.component';

@Component({
  selector: 'app-facture-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, EnvoiEmailComponent],
  template: `
    <div *ngIf="chargement" class="alert alert-info d-flex align-items-center gap-2">
      <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
      Chargement de la facture...
    </div>

    <div *ngIf="erreur" class="alert alert-danger">{{ erreur }}</div>

    <div *ngIf="facture && !chargement" class="consultation-invoice-wrap">
      <div class="d-flex justify-content-between align-items-start mb-3 no-print">
        <div>
          <h4>Facture {{ facture.numeroFacture }}</h4>
          <span class="badge" [ngClass]="badgeClasse()">{{ traduireStatut() }}</span>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary" (click)="imprimerRecu()">
            <i class="bi bi-printer"></i> Imprimer le reçu
          </button>
          <button class="btn btn-outline-primary" *ngIf="facture.statut !== 'ANNULEE' && auth.hasRole('ADMIN','RECEPTIONNISTE')"
                  (click)="envoiOuvert = !envoiOuvert">
            <i class="bi bi-envelope"></i> Envoyer au patient
          </button>
          <button class="btn btn-success" *ngIf="facture.statut === 'EN_ATTENTE' && auth.hasRole('ADMIN','RECEPTIONNISTE')"
                  (click)="ouvrirModalPaiement()">
            <i class="bi bi-cash"></i> Marquer payée
          </button>
          <button class="btn btn-outline-danger" *ngIf="facture.statut === 'EN_ATTENTE' && !facture.factureOrganismeId && auth.hasRole('ADMIN','RECEPTIONNISTE')"
                  (click)="annuler()">
            <i class="bi bi-x-lg"></i> Annuler
          </button>
        </div>
      </div>

      <div class="card p-3 mb-3 no-print" *ngIf="envoiOuvert">
        <h6 class="mb-2">Envoyer la facture {{ facture.numeroFacture }} par e-mail (PDF joint)</h6>
        <app-envoi-email [destinatairesParDefaut]="facture.patient.email || ''" libelle="Envoyer la facture"
                         [placeholder]="facture.patient.email ? '' : 'Aucune adresse enregistrée pour ce patient'"
                         [enCours]="envoiEnCours" (envoyer)="envoyer($event)" (annuler)="envoiOuvert = false" />
        <div class="alert alert-danger py-2 mt-2 mb-0" *ngIf="erreurEnvoi">{{ erreurEnvoi }}</div>
      </div>
      <div class="alert alert-info py-2 no-print" *ngIf="facture.dateEnvoi">
        <i class="bi bi-envelope-check"></i> Envoyée le {{ facture.dateEnvoi | date:'dd/MM/yyyy à HH:mm' }} à {{ facture.envoyeA }}
      </div>

      <div class="invoice-page">
        <header class="invoice-header">
          <div class="clinic-header" aria-label="CABINET MEDICAL DEMBA BODIEL SY">
            <img class="clinic-logo" src="assets/logo-embleme.png" alt="Logo Cabinet Médical Demba Bodiel SY">
            <div class="clinic-name">CABINET MEDICAL DEMBA BODIEL SY</div>
            <div class="clinic-address">Darou Khoudoss route de Mboro</div>
            <div class="clinic-authorization">Aut N° : 3682 du 30/03/15</div>
            <div class="clinic-phone">Tel : 77 519 35 11 / 76 353 48 42</div>
          </div>
        </header>

        <div class="document-title">FACTURE</div>

        <div class="bill-top">
          <div class="bill-box">
            <div class="section-label">Facturer à :</div>
            <div class="bill-name">{{ facture.patient?.prenom }} {{ facture.patient?.nom }}</div>
            <div>{{ facture.patient?.adresse || 'Adresse non renseignée' }}</div>
            <div>{{ facture.patient?.telephone || 'Téléphone non renseigné' }}</div>
            <div>Email : {{ facture.patient?.email || 'Non renseigné' }}</div>
            <div *ngIf="facture.organisme">Pris en charge par : <strong>{{ facture.organisme.nom }}</strong>
              <span *ngIf="facture.matriculeAssure"> (matricule {{ facture.matriculeAssure }})</span></div>
          </div>

          <div class="bill-box details-box">
            <div class="section-label">Détails de la facture :</div>
            <div><span>Date d'émission :</span> {{ facture.dateFacture | date:'dd MMMM yyyy' }}</div>
            <div><span>Échéance :</span> {{ facture.dateEcheance || facture.dateFacture | date:'dd MMMM yyyy' }}</div>
            <div><span>Numéro :</span> {{ facture.numeroFacture || 'N/A' }}</div>
          </div>
        </div>

        <div class="items-table">
          <div class="products-title">Produits</div>
          <div class="table-row header-row">
            <div class="col-description">Désignation</div>
            <div class="col-qty">Qté</div>
            <div class="col-price">Prix</div>
            <div class="col-total">Total (FCFA)</div>
          </div>

          <div class="table-row body-row" *ngFor="let ligne of lignesFacture">
            <div class="col-description">{{ ligne.designation }}</div>
            <div class="col-qty">{{ ligne.quantite }}</div>
            <div class="col-price">{{ afficherMontant(prixUnitaire(ligne)) }}</div>
            <div class="col-total">{{ afficherMontant(montantLigne(ligne)) }}</div>
          </div>

          <div class="table-row body-row" *ngIf="lignesFacture.length === 0">
            <div class="col-description">Aucune ligne de facturation</div>
            <div class="col-qty"></div>
            <div class="col-price"></div>
            <div class="col-total">0 FCFA</div>
          </div>

          <div class="table-row subtotal-row">
            <div class="col-description">Sous-total</div>
            <div class="col-qty"></div>
            <div class="col-price"></div>
            <div class="col-total">{{ afficherMontant(sousTotal()) }}</div>
          </div>

          <div class="table-row tax-row" *ngIf="remise() > 0">
            <div class="col-description">Remise</div>
            <div class="col-qty"></div>
            <div class="col-price"></div>
            <div class="col-total">-{{ afficherMontant(remise()) }}</div>
          </div>

          <ng-container *ngIf="partOrganisme() > 0">
            <div class="table-row subtotal-row">
              <div class="col-description">Total</div>
              <div class="col-qty"></div>
              <div class="col-price"></div>
              <div class="col-total">{{ afficherMontant(totalDu()) }}</div>
            </div>
            <div class="table-row tax-row">
              <div class="col-description">Part {{ facture.organisme?.nom }} ({{ facture.tauxPriseEnCharge }} %)</div>
              <div class="col-qty"></div>
              <div class="col-price"></div>
              <div class="col-total">-{{ afficherMontant(partOrganisme()) }}</div>
            </div>
          </ng-container>

          <div class="table-row total-row">
            <div class="col-description">{{ partOrganisme() > 0 ? 'Net à payer par le patient' : 'Total à payer' }}</div>
            <div class="col-qty"></div>
            <div class="col-price"></div>
            <div class="col-total">{{ afficherMontant(totalDu() - partOrganisme()) }}</div>
          </div>
        </div>

        <div class="observation-block" *ngIf="facture?.observations">
          <div class="observation-label">Observation</div>
          <div class="observation-content">{{ facture.observations }}</div>
        </div>

        <footer class="invoice-footer">
          <div>Darou Khoudoss route de Mboro</div>
          <div>Tel : 77 519 35 11 / 76 353 48 42</div>
        </footer>
      </div>

      <div class="card p-3 mt-3 no-print" *ngIf="modalPaiementOuvert">
        <h6>Confirmer le paiement</h6>
        <div class="d-flex gap-2 align-items-center">
          <select class="form-select" [(ngModel)]="modePaiementChoisi" style="max-width: 250px;">
            <option value="ESPECES">Espèces</option>
            <option value="CARTE_BANCAIRE">Carte bancaire</option>
            <option value="MOBILE_MONEY">Mobile Money</option>
            <option value="ASSURANCE">Assurance</option>
            <option value="VIREMENT">Virement</option>
          </select>
          <button class="btn btn-success" (click)="confirmerPaiement()">Confirmer</button>
          <button class="btn btn-outline-secondary" (click)="modalPaiementOuvert = false">Annuler</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .consultation-invoice-wrap {
        max-width: 1180px;
        margin: 0 auto;
        padding: 0 0 28px;
        font-family: 'Segoe UI', Arial, sans-serif;
      }

      .invoice-page {
        background: #f3f3f3;
        border: 2px solid #2f7d5a;
        color: #1d1d1d;
        box-shadow: none;
      }

      .invoice-header {
        padding: 14px 24px 8px;
        border-bottom: 0;
        background: #f3f3f3;
        text-align: center;
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

      .products-title {
        padding: 10px 18px 6px;
        font-size: 1.15rem;
        font-weight: 800;
        color: #1d1d1d;
      }

      .bill-top {
        display: grid;
        grid-template-columns: 1.35fr 0.95fr;
        border-bottom: 3px solid #2f7d5a;
      }

      .bill-box {
        padding: 10px 18px 8px;
        font-size: 0.94rem;
        line-height: 1.3;
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

      .items-table {
        display: grid;
        width: 100%;
        font-size: 0.9rem;
      }

      .table-row {
        display: grid;
        grid-template-columns: minmax(260px, 2.8fr) 0.6fr 1fr 1fr;
        align-items: center;
        border-bottom: 1px solid rgba(47, 125, 90, 0.8);
      }

      .header-row {
        background: #2f7d5a;
        color: #fff;
        font-weight: 700;
        min-height: 38px;
      }

      .header-row > div,
      .body-row > div,
      .subtotal-row > div,
      .tax-row > div,
      .total-row > div {
        padding: 7px 10px;
      }

      .body-row > div,
      .subtotal-row > div,
      .tax-row > div {
        background: rgba(255,255,255,0.15);
      }

      .col-description {
        text-align: left;
      }

      .col-qty,
      .col-price,
      .col-total {
        text-align: center;
      }

      .subtotal-row .col-total,
      .tax-row .col-total,
      .total-row .col-total {
        text-align: right;
        font-weight: 700;
      }

      .subtotal-row .col-description,
      .tax-row .col-description {
        font-weight: 600;
      }

      .total-row {
        background: #2f7d5a;
        color: #fff;
        font-weight: 800;
        min-height: 42px;
      }

      .observation-block {
        margin-top: 18px;
        padding: 12px 18px 0;
        border-top: 2px solid #2f7d5a;
      }

      .observation-label {
        font-size: 1.05rem;
        font-weight: 800;
        margin-bottom: 6px;
      }

      .observation-content {
        white-space: pre-wrap;
        line-height: 1.5;
      }

      .invoice-footer {
        padding: 14px 18px 10px;
        border-top: 0;
        color: #111;
        font-family: Georgia, 'Times New Roman', serif;
        font-size: 1rem;
        font-style: italic;
        line-height: 1.15;
        text-align: center;
      }

      .invoice-footer div {
        margin: 0;
      }

      /* Smartphone : le document tient dans la largeur de l'écran. */
      @media (max-width: 575.98px) {
        .bill-top { grid-template-columns: 1fr; }
        .bill-top .bill-box + .bill-box { border-left: 0; border-top: 2px solid #2f7d5a; }
        .items-table { font-size: .8rem; }
        .table-row { grid-template-columns: minmax(0, 2fr) .45fr 1fr 1fr; }
        .header-row > div, .body-row > div, .subtotal-row > div, .tax-row > div, .total-row > div { padding: 6px; overflow-wrap: anywhere; }
      }

      @media print {
        body {
          background: #fff;
        }

        .consultation-invoice-wrap {
          max-width: none;
          padding: 0;
        }

        .no-print {
          display: none !important;
        }

        .invoice-page {
          border: none;
          box-shadow: none;
          page-break-inside: avoid;
        }

        .invoice-header,
        .document-title,
        .bill-top,
        .items-table,
        .invoice-footer {
          page-break-inside: avoid;
        }
      }
    `
  ]
})
export class FactureDetailComponent implements OnInit {
  facture: Facture | null = null;
  lignesFacture: Facture['lignes'] = [];
  chargement = true;
  erreur = '';
  modalPaiementOuvert = false;
  modePaiementChoisi: ModePaiement = 'ESPECES';
  envoiOuvert = false;
  envoiEnCours = false;
  erreurEnvoi = '';

  constructor(
    private route: ActivatedRoute,
    private factureService: FactureService,
    private documentService: DocumentService,
    private envoiService: EnvoiService,
    public auth: AuthService
  ) {}

  envoyer(req: EnvoiRequest): void {
    if (!this.facture?.id) return;
    this.erreurEnvoi = ''; this.envoiEnCours = true;
    this.envoiService.facturePatient(this.facture.id, req).subscribe({
      next: (f) => {
        this.envoiEnCours = false; this.envoiOuvert = false;
        if (this.facture) { this.facture.dateEnvoi = f.dateEnvoi; this.facture.envoyeA = f.envoyeA; }
      },
      error: (err) => { this.envoiEnCours = false; this.erreurEnvoi = err.error?.message || 'Échec de l\'envoi'; }
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.charger(id);
  }

  charger(id: number): void {
    this.chargement = true;
    this.erreur = '';
    this.factureService.findById(id).subscribe({
      next: (f) => {
        this.facture = f;
        this.lignesFacture = Array.isArray(f.lignes) ? f.lignes : [];
        this.chargement = false;
      },
      error: () => {
        this.facture = null;
        this.lignesFacture = [];
        this.chargement = false;
        this.erreur = 'Impossible de charger cette facture. Veuillez réessayer.';
      }
    });
  }

  imprimerRecu(): void {
    this.documentService.imprimerPage();
  }

  ouvrirModalPaiement(): void {
    this.modalPaiementOuvert = true;
  }

  confirmerPaiement(): void {
    if (!this.facture?.id) return;
    this.factureService.payer(this.facture.id, this.modePaiementChoisi).subscribe((f) => {
      this.facture = f;
      this.lignesFacture = Array.isArray(f.lignes) ? f.lignes : [];
      this.modalPaiementOuvert = false;
    });
  }

  annuler(): void {
    if (!this.facture?.id) return;
    this.factureService.annuler(this.facture.id).subscribe((f) => {
      this.facture = f;
      this.lignesFacture = Array.isArray(f.lignes) ? f.lignes : [];
    });
  }

  traduireStatut(): string {
    const map: Record<string, string> = { EN_ATTENTE: 'En attente', PAYEE: 'Payée', ANNULEE: 'Annulée' };
    return this.facture?.statut ? map[this.facture.statut] : '-';
  }

  badgeClasse(): string {
    const map: Record<string, string> = { EN_ATTENTE: 'bg-warning text-dark', PAYEE: 'bg-success', ANNULEE: 'bg-danger' };
    return this.facture?.statut ? map[this.facture.statut] : 'bg-secondary';
  }

  sousTotal(): number {
    if (this.lignesFacture.length > 0) {
      return this.lignesFacture.reduce((acc, ligne) => acc + this.montantLigne(ligne), 0);
    }
    const totalEnregistre = Number(this.facture?.montantTotal) || 0;
    return totalEnregistre + this.remise();
  }

  totalDu(): number {
    return Math.max(this.sousTotal() - this.remise(), 0);
  }

  prixUnitaire(ligne: Facture['lignes'][number]): number {
    return Number(ligne.prixUnitaire) || 0;
  }

  montantLigne(ligne: Facture['lignes'][number]): number {
    const montant = Number(ligne.montant);
    return Number.isFinite(montant) ? montant : this.prixUnitaire(ligne) * (Number(ligne.quantite) || 0);
  }

  remise(): number {
    return Math.max(Number(this.facture?.remise) || 0, 0);
  }

  partOrganisme(): number {
    return Math.max(Number(this.facture?.partOrganisme) || 0, 0);
  }

  afficherMontant(valeur: number): string {
    return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(valeur) || 0)} FCFA`;
  }
}
