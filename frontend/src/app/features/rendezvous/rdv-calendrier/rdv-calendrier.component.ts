import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RendezVous, StatutRendezVous } from '../../../core/models/rendezvous.model';
import { Utilisateur } from '../../../core/models/user.model';
import { RendezVousService } from '../../../core/services/rendezvous.service';
import { UtilisateurService } from '../../../core/services/utilisateur.service';
import { AuthService } from '../../../core/services/auth.service';

type Vue = 'mois' | 'semaine' | 'jour';

/** Colonne de la grille horaire : un jour (vue semaine) ou un médecin (vue jour). */
interface Colonne {
  cle: string;
  libelle: string;
  sousLibelle?: string;
  date: Date;
  medecinId?: number;
  aujourdhui: boolean;
  evenements: EvenementPlace[];
}

interface EvenementPlace {
  rdv: RendezVous;
  debut: Date;
  fin: Date;
  haut: number;
  hauteur: number;
  gauche: number;
  largeur: number;
}

interface CaseMois {
  date: Date;
  horsMois: boolean;
  aujourdhui: boolean;
  rdvs: RendezVous[];
}

const HEURE_DEBUT = 7;
const HEURE_FIN = 20;
const PX_PAR_MINUTE = 1.2;
const PAS_MINUTES = 15;
const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MOIS_COURTS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

@Component({
  selector: 'app-rdv-calendrier',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
      <h4 class="mb-0"><i class="bi bi-calendar3"></i> Calendrier des rendez-vous</h4>
      <div class="d-flex gap-2">
        <a routerLink="/rendezvous" class="btn btn-outline-secondary"><i class="bi bi-list-ul"></i> Liste</a>
        <button class="btn btn-primary" *ngIf="peutModifier" (click)="nouveau()">
          <i class="bi bi-plus-lg"></i> Nouveau rendez-vous
        </button>
      </div>
    </div>

    <div class="card p-2 mb-2">
      <div class="d-flex flex-wrap gap-2 align-items-center">
        <div class="btn-group">
          <button class="btn btn-light border" (click)="deplacer(-1)" title="Précédent"><i class="bi bi-chevron-left"></i></button>
          <button class="btn btn-light border" (click)="allerAujourdhui()">Aujourd'hui</button>
          <button class="btn btn-light border" (click)="deplacer(1)" title="Suivant"><i class="bi bi-chevron-right"></i></button>
        </div>
        <strong class="titre-periode">{{ titre }}</strong>
        <div class="ms-auto d-flex gap-2 flex-wrap">
          <select class="form-select form-select-sm w-auto" [(ngModel)]="medecinId" (change)="charger()">
            <option [ngValue]="null">Tous les médecins</option>
            <option *ngFor="let m of medecins" [ngValue]="m.id">Dr. {{ m.prenom }} {{ m.nom }}</option>
          </select>
          <div class="btn-group btn-group-sm">
            <button class="btn" [class.btn-primary]="vue === 'mois'" [class.btn-light]="vue !== 'mois'" [class.border]="vue !== 'mois'" (click)="changerVue('mois')">Mois</button>
            <button class="btn" [class.btn-primary]="vue === 'semaine'" [class.btn-light]="vue !== 'semaine'" [class.border]="vue !== 'semaine'" (click)="changerVue('semaine')">Semaine</button>
            <button class="btn" [class.btn-primary]="vue === 'jour'" [class.btn-light]="vue !== 'jour'" [class.border]="vue !== 'jour'" (click)="changerVue('jour')">Jour</button>
          </div>
        </div>
      </div>
      <div class="legende mt-2">
        <span *ngFor="let s of statuts" class="me-3"><i class="pastille" [ngClass]="'st-' + s"></i>{{ libelleStatut(s) }}</span>
        <span class="text-muted" *ngIf="peutModifier">· Glissez un rendez-vous pour le déplacer, cliquez sur un créneau libre pour en créer un.</span>
      </div>
    </div>

    <div class="alert alert-danger py-2" *ngIf="erreur">{{ erreur }}
      <button type="button" class="btn-close float-end" (click)="erreur = ''"></button></div>

    <!-- ===== VUE MOIS ===== -->
    <div class="card calendrier" *ngIf="vue === 'mois'">
      <div class="grille-mois">
        <div class="entete-mois" *ngFor="let j of joursSemaine">{{ j }}</div>
        <div *ngFor="let c of casesMois" class="case-mois" [class.hors-mois]="c.horsMois" [class.aujourdhui]="c.aujourdhui"
             (click)="ouvrirJour(c.date)" (dragover)="autoriserDepot($event)" (drop)="deposerSurJour($event, c.date)">
          <div class="num-jour">{{ c.date.getDate() }}</div>
          <div *ngFor="let r of c.rdvs | slice:0:3" class="evt-mois" [ngClass]="'st-' + r.statut"
               [attr.draggable]="deplacable(r)" (dragstart)="commencerGlisser($event, r)"
               (click)="$event.stopPropagation(); selection = r">
            <span class="heure">{{ r.dateHeure | date:'HH:mm' }}</span> {{ r.patient.prenom }} {{ r.patient.nom }}
          </div>
          <div class="plus" *ngIf="c.rdvs.length > 3">+{{ c.rdvs.length - 3 }} autre(s)</div>
        </div>
      </div>
    </div>

    <!-- ===== VUES SEMAINE / JOUR ===== -->
    <div class="card calendrier" *ngIf="vue !== 'mois'">
      <div class="defilement">
        <div class="grille" [style.min-width.px]="colonnes.length * 130 + 56">
          <div class="ligne-entete">
            <div class="gouttiere"></div>
            <div *ngFor="let col of colonnes" class="entete-col" [class.aujourdhui]="col.aujourdhui"
                 (click)="vue === 'semaine' && ouvrirJour(col.date)" [class.cliquable]="vue === 'semaine'">
              <div class="fw-semibold">{{ col.libelle }}</div>
              <div class="small text-muted" *ngIf="col.sousLibelle">{{ col.sousLibelle }}</div>
            </div>
          </div>
          <div class="corps" [style.height.px]="hauteurGrille">
            <div class="gouttiere">
              <div *ngFor="let h of heures" class="libelle-heure" [style.top.px]="(h - heureDebut) * 60 * pxParMinute">{{ h }}:00</div>
            </div>
            <div *ngFor="let col of colonnes" class="colonne" [class.aujourdhui]="col.aujourdhui"
                 (click)="cliquerCreneau($event, col)" (dragover)="autoriserDepot($event)" (drop)="deposerSurCreneau($event, col)">
              <div *ngFor="let h of heures" class="trait-heure" [style.top.px]="(h - heureDebut) * 60 * pxParMinute"></div>
              <div *ngFor="let h of heures" class="trait-demi" [style.top.px]="((h - heureDebut) * 60 + 30) * pxParMinute"></div>
              <div class="maintenant" *ngIf="col.aujourdhui && positionMaintenant !== null" [style.top.px]="positionMaintenant"></div>
              <div *ngFor="let e of col.evenements" class="evt" [ngClass]="'st-' + e.rdv.statut"
                   [class.selectionne]="selection?.id === e.rdv.id"
                   [style.top.px]="e.haut" [style.height.px]="e.hauteur"
                   [style.left.%]="e.gauche" [style.width.%]="e.largeur"
                   [attr.draggable]="deplacable(e.rdv)" (dragstart)="commencerGlisser($event, e.rdv)"
                   (click)="$event.stopPropagation(); selection = e.rdv"
                   [title]="infobulle(e.rdv)">
                <ng-container *ngIf="e.hauteur >= 40; else compact">
                  <div class="evt-heure">{{ e.debut | date:'HH:mm' }} – {{ e.fin | date:'HH:mm' }}</div>
                  <div class="evt-titre">{{ e.rdv.patient.prenom }} {{ e.rdv.patient.nom }}</div>
                </ng-container>
                <ng-template #compact>
                  <div class="evt-titre"><span class="evt-heure">{{ e.debut | date:'HH:mm' }}</span> {{ e.rdv.patient.prenom }} {{ e.rdv.patient.nom }}</div>
                </ng-template>
                <div class="evt-sous" *ngIf="e.hauteur > 56">
                  <span *ngIf="vue === 'semaine' && !medecinId">Dr. {{ e.rdv.medecin.nom }}</span>
                  <span *ngIf="e.rdv.motif"> · {{ e.rdv.motif }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== PANNEAU DÉTAIL ===== -->
    <div class="detail-fond" *ngIf="selection" (click)="selection = null"></div>
    <aside class="detail card shadow" *ngIf="selection as r">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <div>
          <span class="badge" [ngClass]="'st-' + r.statut">{{ libelleStatut(r.statut) }}</span>
          <h5 class="mt-2 mb-0">{{ r.patient.prenom }} {{ r.patient.nom }}</h5>
          <div class="small text-muted">{{ r.patient.numeroDossier }}</div>
        </div>
        <button class="btn-close" (click)="selection = null" aria-label="Fermer"></button>
      </div>
      <dl class="mb-2">
        <dt>Date</dt><dd>{{ dateLongue(r.dateHeure) }}</dd>
        <dt>Heure</dt><dd>{{ r.dateHeure | date:'HH:mm' }} · {{ r.dureeMinutes || 30 }} min</dd>
        <dt>Médecin</dt><dd>Dr. {{ r.medecin.prenom }} {{ r.medecin.nom }}</dd>
        <dt>Motif</dt><dd>{{ r.motif || '-' }}</dd>
        <ng-container *ngIf="r.notes"><dt>Notes</dt><dd>{{ r.notes }}</dd></ng-container>
        <ng-container *ngIf="r.patient.telephone"><dt>Téléphone</dt><dd>{{ r.patient.telephone }}</dd></ng-container>
        <ng-container *ngIf="r.patient.organisme"><dt>Prise en charge</dt><dd>{{ r.patient.organisme?.nom }}</dd></ng-container>
      </dl>

      <ng-container *ngIf="peutModifier && r.statut !== 'TERMINE' && r.statut !== 'ANNULE'">
        <div class="row g-2 mb-2">
          <div class="col-7">
            <label class="form-label small mb-0">Déplacer au</label>
            <input type="datetime-local" class="form-control form-control-sm" [(ngModel)]="nouvelleDate">
          </div>
          <div class="col-5">
            <label class="form-label small mb-0">Durée (min)</label>
            <input type="number" min="5" step="5" class="form-control form-control-sm" [(ngModel)]="nouvelleDuree">
          </div>
        </div>
        <button class="btn btn-sm btn-primary w-100 mb-2" (click)="enregistrerHoraire(r)"
                [disabled]="!nouvelleDate">Enregistrer l'horaire</button>
        <div class="d-flex flex-wrap gap-1 mb-2">
          <button class="btn btn-sm btn-light border" *ngIf="r.statut === 'PLANIFIE'" (click)="changerStatut(r, 'CONFIRME')"><i class="bi bi-check-lg text-info"></i> Confirmer</button>
          <button class="btn btn-sm btn-light border" *ngIf="r.statut !== 'EN_COURS'" (click)="changerStatut(r, 'EN_COURS')"><i class="bi bi-play-fill text-primary"></i> En cours</button>
          <button class="btn btn-sm btn-light border" (click)="changerStatut(r, 'TERMINE')"><i class="bi bi-check2-all text-success"></i> Effectué</button>
          <button class="btn btn-sm btn-light border" (click)="changerStatut(r, 'ANNULE')"><i class="bi bi-x-lg text-danger"></i> Annuler le RDV</button>
        </div>
      </ng-container>
      <div class="d-flex gap-2 mt-auto">
        <a class="btn btn-sm btn-light border" [routerLink]="['/patients', r.patient.id]"><i class="bi bi-person"></i> Dossier patient</a>
        <button class="btn btn-sm btn-light border text-danger ms-auto" *ngIf="auth.hasRole('ADMIN','RECEPTIONNISTE')" (click)="supprimer(r)">
          <i class="bi bi-trash"></i> Supprimer</button>
      </div>
    </aside>
  `,
  styles: [`
    .titre-periode { font-size: 1.05rem; text-transform: capitalize; }
    .legende { font-size: .8rem; }
    .pastille { display: inline-block; width: 12px; height: 12px; border-radius: 3px; margin-right: 4px; vertical-align: -1px; border-left: 3px solid; }
    .calendrier { overflow: hidden; }
    .defilement { overflow-x: auto; }
    .grille { position: relative; }
    .ligne-entete { display: flex; border-bottom: 1px solid var(--bs-border-color); position: sticky; top: 0; background: var(--bs-body-bg); z-index: 3; }
    .entete-col { flex: 1; text-align: center; padding: 6px 4px; border-left: 1px solid var(--bs-border-color); }
    .entete-col.aujourdhui { color: var(--eclinique-primary, #0b7a53); }
    .cliquable { cursor: pointer; }
    .gouttiere { width: 56px; flex: 0 0 56px; position: relative; }
    .corps { display: flex; position: relative; }
    .libelle-heure { position: absolute; right: 6px; transform: translateY(-50%); font-size: .72rem; color: var(--bs-secondary-color); }
    .libelle-heure:first-child { transform: none; }
    .colonne { flex: 1; position: relative; border-left: 1px solid var(--bs-border-color); cursor: copy; }
    .colonne.aujourdhui { background: rgba(11, 122, 83, .05); }
    .trait-heure, .trait-demi { position: absolute; left: 0; right: 0; border-top: 1px solid var(--bs-border-color); pointer-events: none; }
    .trait-demi { border-top-style: dashed; opacity: .5; }
    .maintenant { position: absolute; left: 0; right: 0; border-top: 2px solid #dc3545; z-index: 2; pointer-events: none; }
    .maintenant::before { content: ''; position: absolute; left: -5px; top: -6px; width: 10px; height: 10px; border-radius: 50%; background: #dc3545; }
    .evt { position: absolute; padding: 2px 6px; border-radius: 6px; font-size: .76rem; line-height: 1.2; overflow: hidden;
           cursor: pointer; border-left: 4px solid; box-shadow: 0 1px 2px rgba(0,0,0,.12); z-index: 1; }
    .evt[draggable="true"] { cursor: grab; }
    .evt:hover, .evt.selectionne { z-index: 4; box-shadow: 0 2px 8px rgba(0,0,0,.25); }
    .evt-heure { font-weight: 600; font-size: .7rem; opacity: .85; }
    .evt-titre { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .evt-sous { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; opacity: .85; }
    .st-PLANIFIE { background: #e9ecef; border-color: #6c757d; color: #343a40; }
    .st-CONFIRME { background: #cff4fc; border-color: #0aa2c0; color: #055160; }
    .st-EN_COURS { background: #cfe2ff; border-color: #0d6efd; color: #052c65; }
    .st-TERMINE { background: #d1e7dd; border-color: #198754; color: #0a3622; }
    .st-ANNULE { background: #f8d7da; border-color: #dc3545; color: #58151c; text-decoration: line-through; opacity: .75; }
    .badge.st-PLANIFIE, .badge.st-CONFIRME, .badge.st-EN_COURS, .badge.st-TERMINE, .badge.st-ANNULE { border: 1px solid; text-decoration: none; }
    .grille-mois { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); }
    .entete-mois { text-align: center; font-weight: 600; padding: 6px; border-bottom: 1px solid var(--bs-border-color); }
    .case-mois { min-height: 110px; border-right: 1px solid var(--bs-border-color); border-bottom: 1px solid var(--bs-border-color);
                 padding: 4px; cursor: pointer; overflow: hidden; }
    .case-mois:nth-child(7n + 7) { border-right: 0; }
    .case-mois:hover { background: var(--bs-tertiary-bg); }
    .case-mois.hors-mois { opacity: .45; }
    .case-mois.aujourdhui .num-jour { background: var(--eclinique-primary, #0b7a53); color: #fff; border-radius: 50%; width: 24px; text-align: center; }
    .num-jour { font-size: .8rem; font-weight: 600; margin-bottom: 2px; }
    .evt-mois { font-size: .72rem; padding: 1px 4px; margin-bottom: 2px; border-radius: 4px; border-left: 3px solid;
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .evt-mois .heure { font-weight: 600; }
    .plus { font-size: .72rem; color: var(--bs-secondary-color); }
    .detail-fond { position: fixed; inset: 0; z-index: 1040; background: rgba(0,0,0,.15); }
    .detail { position: fixed; top: 0; right: 0; bottom: 0; width: min(380px, 100vw); z-index: 1045; padding: 16px;
              border-radius: 0; display: flex; flex-direction: column; overflow-y: auto; }
    .detail dl { display: grid; grid-template-columns: 110px 1fr; gap: 4px 8px; font-size: .9rem; }
    .detail dt { color: var(--bs-secondary-color); font-weight: 500; }
    .detail dd { margin: 0; }
    @media (max-width: 576px) { .case-mois { min-height: 70px; } .evt-mois { font-size: .65rem; } }
  `]
})
export class RdvCalendrierComponent implements OnInit, OnDestroy {
  vue: Vue = 'semaine';
  reference = this.debutJour(new Date());
  medecinId: number | null = null;
  medecins: Utilisateur[] = [];
  rendezVous: RendezVous[] = [];
  colonnes: Colonne[] = [];
  casesMois: CaseMois[] = [];
  nouvelleDate = '';
  nouvelleDuree = 30;
  erreur = '';
  heureDebut = HEURE_DEBUT;
  heureFin = HEURE_FIN;
  positionMaintenant: number | null = null;

  readonly pxParMinute = PX_PAR_MINUTE;
  readonly joursSemaine = JOURS;
  readonly statuts: StatutRendezVous[] = ['PLANIFIE', 'CONFIRME', 'EN_COURS', 'TERMINE', 'ANNULE'];

  private glisse: RendezVous | null = null;
  private minuteur?: ReturnType<typeof setInterval>;
  private _selection: RendezVous | null = null;

  constructor(
    private rendezVousService: RendezVousService,
    private utilisateurService: UtilisateurService,
    public auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Sur smartphone, sept colonnes ne tiennent pas : on part de la vue du jour.
    if (window.matchMedia('(max-width: 575.98px)').matches) this.vue = 'jour';
    try {
      const vue = localStorage.getItem('rdv-calendrier-vue') as Vue | null;
      if (vue === 'mois' || vue === 'semaine' || vue === 'jour') this.vue = vue;
    } catch { /* stockage indisponible : vue par défaut */ }
    this.utilisateurService.findMedecins().subscribe((m) => { this.medecins = m; this.construire(); });
    this.charger();
    this.minuteur = setInterval(() => this.majMaintenant(), 60000);
  }

  ngOnDestroy(): void {
    if (this.minuteur) clearInterval(this.minuteur);
  }

  get peutModifier(): boolean {
    return this.auth.hasRole('ADMIN', 'RECEPTIONNISTE', 'MEDECIN');
  }

  get heures(): number[] {
    return Array.from({ length: this.heureFin - this.heureDebut + 1 }, (_, i) => this.heureDebut + i);
  }

  get hauteurGrille(): number {
    return (this.heureFin - this.heureDebut) * 60 * PX_PAR_MINUTE;
  }

  get titre(): string {
    const r = this.reference;
    if (this.vue === 'mois') return `${MOIS[r.getMonth()]} ${r.getFullYear()}`;
    if (this.vue === 'jour') return `${JOURS[(r.getDay() + 6) % 7]} ${r.getDate()} ${MOIS[r.getMonth()]} ${r.getFullYear()}`;
    const [debut, finExclue] = this.periode();
    const fin = this.ajouterJours(finExclue, -1);
    return debut.getMonth() === fin.getMonth()
      ? `${debut.getDate()} – ${fin.getDate()} ${MOIS[fin.getMonth()]} ${fin.getFullYear()}`
      : `${debut.getDate()} ${MOIS[debut.getMonth()]} – ${fin.getDate()} ${MOIS[fin.getMonth()]} ${fin.getFullYear()}`;
  }

  // ---------- Navigation ----------

  changerVue(vue: Vue): void {
    this.vue = vue;
    try { localStorage.setItem('rdv-calendrier-vue', vue); } catch { /* ignoré */ }
    this.charger();
  }

  deplacer(sens: number): void {
    const r = new Date(this.reference);
    if (this.vue === 'mois') r.setMonth(r.getMonth() + sens, 1);
    else r.setDate(r.getDate() + sens * (this.vue === 'semaine' ? 7 : 1));
    this.reference = r;
    this.charger();
  }

  allerAujourdhui(): void {
    this.reference = this.debutJour(new Date());
    this.charger();
  }

  ouvrirJour(date: Date): void {
    this.reference = this.debutJour(date);
    this.changerVue('jour');
  }

  // ---------- Chargement ----------

  charger(): void {
    const [debut, fin] = this.periode();
    this.rendezVousService.findAll({
      debut: this.isoLocal(debut),
      fin: this.isoLocal(new Date(fin.getTime() - 1000)),
      medecinId: this.medecinId ?? undefined
    }).subscribe({
      next: (rdvs) => {
        this.rendezVous = rdvs;
        if (this.selection) this.selection = rdvs.find((r) => r.id === this.selection!.id) ?? null;
        this.construire();
      },
      error: (err) => (this.erreur = err.error?.message || 'Impossible de charger les rendez-vous')
    });
  }

  /** [début inclus, fin exclue] de la période affichée. */
  private periode(): [Date, Date] {
    const r = this.reference;
    if (this.vue === 'jour') return [this.debutJour(r), this.ajouterJours(r, 1)];
    if (this.vue === 'semaine') {
      const lundi = this.lundi(r);
      return [lundi, this.ajouterJours(lundi, 7)];
    }
    const premier = new Date(r.getFullYear(), r.getMonth(), 1);
    const debut = this.lundi(premier);
    return [debut, this.ajouterJours(debut, 42)];
  }

  private construire(): void {
    if (this.vue === 'mois') this.construireMois();
    else this.construireGrille();
    this.majMaintenant();
  }

  private construireMois(): void {
    const [debut] = this.periode();
    const aujourdhui = this.debutJour(new Date()).getTime();
    this.casesMois = Array.from({ length: 42 }, (_, i) => {
      const date = this.ajouterJours(debut, i);
      return {
        date,
        horsMois: date.getMonth() !== this.reference.getMonth(),
        aujourdhui: date.getTime() === aujourdhui,
        rdvs: this.rendezVous.filter((r) => this.memeJour(this.parse(r.dateHeure), date))
      };
    });
  }

  private construireGrille(): void {
    // Étend la plage horaire si des rendez-vous sortent de 7h–20h
    let min = HEURE_DEBUT, max = HEURE_FIN;
    for (const r of this.rendezVous) {
      const d = this.parse(r.dateHeure);
      const f = new Date(d.getTime() + (r.dureeMinutes || 30) * 60000);
      min = Math.min(min, d.getHours());
      max = Math.max(max, f.getHours() + (f.getMinutes() > 0 ? 1 : 0));
    }
    this.heureDebut = min;
    this.heureFin = Math.min(max, 24);

    const aujourdhui = this.debutJour(new Date()).getTime();
    if (this.vue === 'semaine') {
      const lundi = this.lundi(this.reference);
      this.colonnes = Array.from({ length: 7 }, (_, i) => {
        const date = this.ajouterJours(lundi, i);
        return {
          cle: date.toISOString(),
          libelle: `${JOURS[i]} ${date.getDate()}`,
          sousLibelle: MOIS_COURTS[date.getMonth()],
          date,
          aujourdhui: date.getTime() === aujourdhui,
          evenements: this.placer(this.rendezVous.filter((r) => this.memeJour(this.parse(r.dateHeure), date)))
        };
      });
      return;
    }

    // Vue jour : une colonne par médecin pour voir les plannings côte à côte
    const date = this.debutJour(this.reference);
    const duJour = this.rendezVous.filter((r) => this.memeJour(this.parse(r.dateHeure), date));
    const medecins = this.medecinId
      ? this.medecins.filter((m) => m.id === this.medecinId)
      : this.medecins;
    const colonnesMedecins = medecins.length ? medecins : this.medecinsDepuisRdv(duJour);
    this.colonnes = colonnesMedecins.map((m) => ({
      cle: String(m.id),
      libelle: `Dr. ${m.prenom} ${m.nom}`,
      sousLibelle: `${duJour.filter((r) => r.medecin.id === m.id && r.statut !== 'ANNULE').length} rdv`,
      date,
      medecinId: m.id,
      aujourdhui: date.getTime() === aujourdhui,
      evenements: this.placer(duJour.filter((r) => r.medecin.id === m.id))
    }));
  }

  private medecinsDepuisRdv(rdvs: RendezVous[]): Utilisateur[] {
    const parId = new Map<number, Utilisateur>();
    rdvs.forEach((r) => r.medecin.id && parId.set(r.medecin.id, r.medecin));
    return [...parId.values()];
  }

  /** Positionne les rendez-vous d'une colonne ; ceux qui se chevauchent sont mis côte à côte. */
  private placer(rdvs: RendezVous[]): EvenementPlace[] {
    const items = rdvs
      .map((rdv) => {
        const debut = this.parse(rdv.dateHeure);
        return { rdv, debut, fin: new Date(debut.getTime() + (rdv.dureeMinutes || 30) * 60000), voie: 0 };
      })
      .sort((a, b) => a.debut.getTime() - b.debut.getTime() || b.fin.getTime() - a.fin.getTime());

    const resultat: EvenementPlace[] = [];
    let groupe: typeof items = [];
    let finGroupe = 0;
    const fermerGroupe = () => {
      const voies = Math.max(1, ...groupe.map((g) => g.voie + 1));
      for (const g of groupe) {
        const minutesDebut = (g.debut.getHours() - this.heureDebut) * 60 + g.debut.getMinutes();
        const duree = (g.fin.getTime() - g.debut.getTime()) / 60000;
        resultat.push({
          rdv: g.rdv, debut: g.debut, fin: g.fin,
          haut: minutesDebut * PX_PAR_MINUTE,
          hauteur: Math.max(duree * PX_PAR_MINUTE - 2, 20),
          gauche: (g.voie / voies) * 100,
          largeur: 100 / voies - 1
        });
      }
      groupe = [];
    };

    for (const item of items) {
      if (groupe.length && item.debut.getTime() >= finGroupe) fermerGroupe();
      const finsParVoie: number[] = [];
      groupe.forEach((g) => (finsParVoie[g.voie] = Math.max(finsParVoie[g.voie] ?? 0, g.fin.getTime())));
      let voie = 0;
      while (finsParVoie[voie] !== undefined && finsParVoie[voie] > item.debut.getTime()) voie++;
      item.voie = voie;
      groupe.push(item);
      finGroupe = Math.max(groupe.length === 1 ? 0 : finGroupe, item.fin.getTime());
    }
    if (groupe.length) fermerGroupe();
    return resultat;
  }

  private majMaintenant(): void {
    const n = new Date();
    const minutes = (n.getHours() - this.heureDebut) * 60 + n.getMinutes();
    this.positionMaintenant = minutes >= 0 && minutes <= (this.heureFin - this.heureDebut) * 60 ? minutes * PX_PAR_MINUTE : null;
  }

  // ---------- Création / déplacement ----------

  nouveau(): void {
    this.router.navigate(['/rendezvous/nouveau'], { queryParams: { retour: 'calendrier' } });
  }

  cliquerCreneau(event: MouseEvent, col: Colonne): void {
    if (!this.peutModifier) return;
    const date = this.dateDepuisPosition(event, col);
    this.router.navigate(['/rendezvous/nouveau'], {
      queryParams: {
        dateHeure: this.isoLocal(date).slice(0, 16),
        medecinId: col.medecinId ?? this.medecinId ?? undefined,
        retour: 'calendrier'
      }
    });
  }

  deplacable(r: RendezVous): boolean {
    return this.peutModifier && r.statut !== 'TERMINE' && r.statut !== 'ANNULE';
  }

  commencerGlisser(event: DragEvent, r: RendezVous): void {
    if (!this.deplacable(r)) { event.preventDefault(); return; }
    this.glisse = r;
    event.dataTransfer?.setData('text/plain', String(r.id));
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  }

  autoriserDepot(event: DragEvent): void {
    if (this.glisse) event.preventDefault();
  }

  deposerSurCreneau(event: DragEvent, col: Colonne): void {
    event.preventDefault();
    const r = this.glisse;
    this.glisse = null;
    if (!r) return;
    const date = this.dateDepuisPosition(event, col);
    this.reprogrammer(r, date, col.medecinId);
  }

  deposerSurJour(event: DragEvent, jour: Date): void {
    event.preventDefault();
    const r = this.glisse;
    this.glisse = null;
    if (!r) return;
    const ancienne = this.parse(r.dateHeure);
    const date = new Date(jour);
    date.setHours(ancienne.getHours(), ancienne.getMinutes(), 0, 0);
    this.reprogrammer(r, date);
  }

  private reprogrammer(r: RendezVous, date: Date, medecinId?: number): void {
    const ancienne = this.parse(r.dateHeure);
    const changeMedecin = medecinId !== undefined && medecinId !== r.medecin.id;
    if (date.getTime() === ancienne.getTime() && !changeMedecin) return;
    const payload: any = { dateHeure: this.isoLocal(date) };
    if (changeMedecin) payload.medecin = { id: medecinId };
    this.rendezVousService.update(r.id!, payload).subscribe({
      next: () => this.charger(),
      error: (err) => {
        this.erreur = err.error?.message || 'Impossible de déplacer ce rendez-vous';
        this.charger();
      }
    });
  }

  private dateDepuisPosition(event: MouseEvent, col: Colonne): Date {
    const colonne = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const minutes = Math.max(0, (event.clientY - colonne.top) / PX_PAR_MINUTE);
    const arrondi = Math.floor(minutes / PAS_MINUTES) * PAS_MINUTES;
    const date = new Date(col.date);
    date.setHours(this.heureDebut, 0, 0, 0);
    return new Date(date.getTime() + arrondi * 60000);
  }

  // ---------- Panneau détail ----------

  set selection(r: RendezVous | null) {
    this._selection = r;
    if (r) {
      this.nouvelleDate = r.dateHeure.slice(0, 16);
      this.nouvelleDuree = r.dureeMinutes || 30;
    }
  }

  get selection(): RendezVous | null { return this._selection; }

  enregistrerHoraire(r: RendezVous): void {
    this.rendezVousService.update(r.id!, {
      dateHeure: `${this.nouvelleDate}:00`,
      dureeMinutes: Number(this.nouvelleDuree) || 30
    }).subscribe({
      next: () => this.charger(),
      error: (err) => (this.erreur = err.error?.message || 'Impossible de modifier l\'horaire')
    });
  }

  changerStatut(r: RendezVous, statut: StatutRendezVous): void {
    this.rendezVousService.changerStatut(r.id!, statut).subscribe({
      next: () => this.charger(),
      error: (err) => (this.erreur = err.error?.message || 'Impossible de changer le statut')
    });
  }

  supprimer(r: RendezVous): void {
    if (!confirm(`Supprimer le rendez-vous de ${r.patient.prenom} ${r.patient.nom} ?`)) return;
    this.rendezVousService.delete(r.id!).subscribe({
      next: () => { this.selection = null; this.charger(); },
      error: (err) => (this.erreur = err.error?.message || 'Impossible de supprimer le rendez-vous')
    });
  }

  libelleStatut(statut?: StatutRendezVous): string {
    const map: Record<StatutRendezVous, string> = {
      PLANIFIE: 'Planifié', CONFIRME: 'Confirmé', EN_COURS: 'En cours', TERMINE: 'Effectué', ANNULE: 'Annulé'
    };
    return statut ? map[statut] : '-';
  }

  dateLongue(valeur: string): string {
    const d = this.parse(valeur);
    const jour = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'][d.getDay()];
    return `${jour} ${d.getDate()} ${MOIS[d.getMonth()]} ${d.getFullYear()}`;
  }

  infobulle(r: RendezVous): string {
    return `${r.patient.prenom} ${r.patient.nom} — Dr. ${r.medecin.prenom} ${r.medecin.nom}`
      + (r.motif ? `\n${r.motif}` : '') + `\n${this.libelleStatut(r.statut)}`;
  }

  // ---------- Dates ----------

  /** Le serveur envoie des LocalDateTime sans fuseau : on les lit en heure locale. */
  private parse(valeur: string): Date {
    const [d, t = '00:00:00'] = valeur.split('T');
    const [a, m, j] = d.split('-').map(Number);
    const [h, mi, s] = t.split(':').map((x) => Number.parseInt(x, 10) || 0);
    return new Date(a, m - 1, j, h, mi, s);
  }

  private isoLocal(d: Date): string {
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
  }

  private debutJour(d: Date): Date { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  private ajouterJours(d: Date, n: number): Date { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
  private lundi(d: Date): Date { return this.ajouterJours(d, -((d.getDay() + 6) % 7)); }
  private memeJour(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }
}
