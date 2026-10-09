import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FactureOrganismeService } from '../../core/services/facture-organisme.service';
import { OrganismeService } from '../../core/services/organisme.service';
import { FactureOrganisme, Organisme, PriseEnCharge } from '../../core/models/organisme.model';
import { EnvoiResultat, EnvoiService } from '../../core/services/envoi.service';

@Component({
  selector: 'app-facture-organisme-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <h4 class="mb-3"><i class="bi bi-receipt"></i> Factures assurances & IPM</h4>

    <div class="card p-3 mb-3">
      <h6>Nouvelle facture</h6>
      <div class="row g-2 align-items-end">
        <div class="col-md-4">
          <label class="form-label">Organisme *</label>
          <select class="form-select" [(ngModel)]="organismeId" (change)="apercu = null">
            <option [ngValue]="null">-- Choisir --</option>
            <option *ngFor="let o of organismes" [ngValue]="o.id">{{ o.nom }}</option>
          </select>
        </div>
        <div class="col-md-2">
          <label class="form-label">Du *</label>
          <input type="date" class="form-control" [(ngModel)]="debut" (change)="apercu = null">
        </div>
        <div class="col-md-2">
          <label class="form-label">Au *</label>
          <input type="date" class="form-control" [(ngModel)]="fin" (change)="apercu = null">
        </div>
        <div class="col-md-4 d-flex gap-2">
          <button class="btn btn-outline-primary" (click)="voirApercu()" [disabled]="!organismeId || !debut || !fin">
            <i class="bi bi-eye"></i> Aperçu
          </button>
          <button class="btn btn-primary" (click)="creer()" [disabled]="!apercu?.length">
            <i class="bi bi-file-earmark-plus"></i> Générer la facture
          </button>
        </div>
        <div class="col-12">
          <input class="form-control" placeholder="Observations (facultatif)" [(ngModel)]="observations">
        </div>
      </div>
      <div class="mt-2 d-flex gap-2 flex-wrap">
        <button class="btn btn-sm btn-light border" (click)="moisPrecedent()">Mois précédent</button>
        <button class="btn btn-sm btn-light border" (click)="moisCourant()">Mois en cours</button>
      </div>

      <div class="alert alert-danger mt-3 mb-0" *ngIf="erreur">{{ erreur }}</div>

      <div class="mt-3" *ngIf="apercu">
        <div class="alert alert-info mb-2" *ngIf="!apercu.length">Aucune prise en charge non facturée sur cette période.</div>
        <div class="table-responsive" *ngIf="apercu.length">
          <table class="table table-sm mb-0">
            <thead><tr><th>Date</th><th>Patient</th><th>Matricule</th><th>Acte</th><th class="text-end">Montant</th><th class="text-end">Part organisme</th></tr></thead>
            <tbody>
              <tr *ngFor="let e of apercu">
                <td>{{ e.date | date:'dd/MM/yyyy' }}</td>
                <td>{{ e.patientNom }}</td><td>{{ e.matriculeAssure || '-' }}</td>
                <td>{{ e.acte }}<span class="text-muted small" *ngIf="e.reference"> · {{ e.reference }}</span></td>
                <td class="text-end">{{ e.montant | number:'1.0-0' }}</td>
                <td class="text-end">{{ e.partOrganisme | number:'1.0-0' }}</td>
              </tr>
            </tbody>
            <tfoot><tr class="fw-semibold"><td colspan="5">{{ apercu.length }} prise(s) en charge — total à facturer</td>
              <td class="text-end">{{ totalApercu | number:'1.0-0' }} FCFA</td></tr></tfoot>
          </table>
        </div>
      </div>
    </div>

    <div class="card p-3">
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
        <h6 class="mb-0">Historique</h6>
        <button class="btn btn-sm btn-primary ms-auto" (click)="envoyerEnAttente()" [disabled]="envoiEnCours || !nonEnvoyees"
                title="Envoie par e-mail chaque facture en attente, pas encore envoyée, à son organisme">
          <span class="spinner-border spinner-border-sm me-1" *ngIf="envoiEnCours"></span>
          <i class="bi bi-send" *ngIf="!envoiEnCours"></i> Envoyer les factures non envoyées ({{ nonEnvoyees }})
        </button>
        <select class="form-select form-select-sm w-auto" [(ngModel)]="filtreOrganisme" (change)="charger()">
          <option [ngValue]="null">Tous les organismes</option>
          <option *ngFor="let o of organismes" [ngValue]="o.id">{{ o.nom }}</option>
        </select>
      </div>
      <div class="mb-2" *ngIf="resultatsEnvoi">
        <div class="alert py-2 mb-1" [class.alert-success]="envoyees === resultatsEnvoi.length" [class.alert-warning]="envoyees !== resultatsEnvoi.length">
          {{ envoyees }} facture(s) envoyée(s) sur {{ resultatsEnvoi.length }}.
          <button type="button" class="btn-close float-end" (click)="resultatsEnvoi = null"></button>
        </div>
        <ul class="small mb-0" *ngIf="envoyees !== resultatsEnvoi.length">
          <li *ngFor="let r of resultatsEnvoi" [class.text-danger]="!r.envoye">
            {{ r.reference }} — {{ r.destinataire }} : {{ r.envoye ? 'envoyée à ' + r.destinataires : r.message }}</li>
        </ul>
      </div>
      <div class="alert alert-danger py-2" *ngIf="erreurEnvoi">{{ erreurEnvoi }}</div>
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead><tr><th>N°</th><th>Organisme</th><th>Période</th><th>Émise le</th><th class="text-end">Lignes</th>
            <th class="text-end">Montant</th><th>Statut</th><th>Envoi</th></tr></thead>
          <tbody>
            <tr *ngFor="let f of factures" class="cliquable" (click)="ouvrir(f)">
              <td><strong>{{ f.numero }}</strong></td>
              <td>{{ f.organisme.nom }}</td>
              <td>{{ f.periodeDebut | date:'dd/MM/yyyy' }} → {{ f.periodeFin | date:'dd/MM/yyyy' }}</td>
              <td>{{ f.dateEmission | date:'dd/MM/yyyy' }}</td>
              <td class="text-end">{{ f.nombreLignes }}</td>
              <td class="text-end">{{ f.montantTotal | number:'1.0-0' }} FCFA</td>
              <td><span class="badge" [class.bg-warning]="f.statut === 'EN_ATTENTE'" [class.text-dark]="f.statut === 'EN_ATTENTE'"
                        [class.bg-success]="f.statut === 'PAYEE'" [class.bg-secondary]="f.statut === 'ANNULEE'">{{ libelleStatut(f.statut) }}</span></td>
              <td class="small">
                <span *ngIf="f.dateEnvoi" [title]="'Envoyée à ' + f.envoyeA"><i class="bi bi-envelope-check text-success"></i> {{ f.dateEnvoi | date:'dd/MM/yyyy' }}</span>
                <span *ngIf="!f.dateEnvoi" class="text-muted">{{ f.statut === 'ANNULEE' ? '—' : 'Non envoyée' }}</span>
              </td>
            </tr>
            <tr *ngIf="!factures.length"><td colspan="8" class="text-center text-muted">Aucune facture organisme.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`.cliquable { cursor: pointer; }`]
})
export class FactureOrganismeListComponent implements OnInit {
  organismes: Organisme[] = [];
  factures: FactureOrganisme[] = [];
  organismeId: number | null = null;
  filtreOrganisme: number | null = null;
  debut = '';
  fin = '';
  observations = '';
  apercu: PriseEnCharge[] | null = null;
  erreur = '';
  envoiEnCours = false;
  resultatsEnvoi: EnvoiResultat[] | null = null;
  erreurEnvoi = '';

  constructor(private service: FactureOrganismeService, private organismeService: OrganismeService, private router: Router,
              private envoiService: EnvoiService) {}

  get nonEnvoyees(): number { return this.factures.filter((f) => f.statut === 'EN_ATTENTE' && !f.dateEnvoi).length; }
  get envoyees(): number { return (this.resultatsEnvoi || []).filter((r) => r.envoye).length; }

  envoyerEnAttente(): void {
    if (!confirm(`Envoyer par e-mail les factures en attente non envoyées à leur organisme ?`)) return;
    this.envoiEnCours = true; this.erreurEnvoi = ''; this.resultatsEnvoi = null;
    this.envoiService.facturesOrganismesEnAttente().subscribe({
      next: (r) => { this.envoiEnCours = false; this.resultatsEnvoi = r; this.charger(); },
      error: (err) => { this.envoiEnCours = false; this.erreurEnvoi = err.error?.message || 'Échec de l\'envoi'; }
    });
  }

  ngOnInit(): void {
    this.organismeService.findAll().subscribe((o) => (this.organismes = o));
    this.moisPrecedent();
    this.charger();
  }

  charger(): void { this.service.findAll(this.filtreOrganisme ?? undefined).subscribe((f) => (this.factures = f)); }

  get totalApercu(): number { return (this.apercu || []).reduce((s, e) => s + e.partOrganisme, 0); }

  moisPrecedent(): void { this.definirMois(-1); }
  moisCourant(): void { this.definirMois(0); }

  voirApercu(): void {
    this.erreur = '';
    this.service.apercu(this.requete()).subscribe({
      next: (a) => (this.apercu = a),
      error: (err) => (this.erreur = err.error?.message || 'Erreur lors de l\'aperçu')
    });
  }

  creer(): void {
    this.erreur = '';
    this.service.creer(this.requete()).subscribe({
      next: (f) => this.router.navigate(['/factures-organismes', f.id]),
      error: (err) => (this.erreur = err.error?.message || 'Erreur lors de la création de la facture')
    });
  }

  ouvrir(f: FactureOrganisme): void { this.router.navigate(['/factures-organismes', f.id]); }

  libelleStatut(statut: string): string {
    return statut === 'PAYEE' ? 'Payée' : statut === 'ANNULEE' ? 'Annulée' : 'En attente';
  }

  private requete() {
    return { organismeId: this.organismeId!, periodeDebut: this.debut, periodeFin: this.fin, observations: this.observations };
  }

  private definirMois(decalage: number): void {
    const d = new Date();
    const premier = new Date(d.getFullYear(), d.getMonth() + decalage, 1);
    const dernier = new Date(d.getFullYear(), d.getMonth() + decalage + 1, 0);
    this.debut = this.iso(premier);
    this.fin = this.iso(dernier);
    this.apercu = null;
  }

  private iso(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}
