import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { ComptabiliteService } from '../../core/services/comptabilite.service';
import { Role, Utilisateur } from '../../core/models/user.model';

const LIBELLES_ROLE: Record<Role, string> = {
  ADMIN: 'Administrateur', MEDECIN: 'Médecin', INFIRMIER: 'Infirmier', PHARMACIEN: 'Pharmacien',
  RECEPTIONNISTE: 'Réceptionniste', EMPLOYE: 'Employé'
};

type Popup = 'detail' | 'modification' | 'suppression';

@Component({ selector: 'app-employes', standalone: true, imports: [CommonModule, FormsModule], template: `
  <div class="d-flex justify-content-between align-items-center mb-3"><h4><i class="bi bi-person-badge"></i> Employés</h4><button class="btn btn-primary" (click)="formulaire = !formulaire"><i class="bi bi-plus-lg"></i> Nouvel employé</button></div>
  <div class="alert alert-success py-2" *ngIf="message">{{ message }}</div>
  <div class="card p-3 mb-3" *ngIf="formulaire"><div class="row g-2">
    <div class="col-md-4"><input class="form-control" placeholder="Nom" [(ngModel)]="nouveau.nom"></div><div class="col-md-4"><input class="form-control" placeholder="Prénom" [(ngModel)]="nouveau.prenom"></div><div class="col-md-4"><input class="form-control" placeholder="Email" [(ngModel)]="nouveau.email"></div>
    <div class="col-md-4"><input class="form-control" placeholder="Numéro" [(ngModel)]="nouveau.telephone"></div><div class="col-md-4"><input class="form-control" placeholder="Profession" [(ngModel)]="nouveau.profession"></div><div class="col-md-4"><input class="form-control" type="number" placeholder="Taux horaire FCFA" [(ngModel)]="nouveau.tauxHoraire"></div>
    <div class="col-md-4"><input class="form-control" type="number" placeholder="Expérience (années)" [(ngModel)]="nouveau.anneesExperience"></div><div class="col-md-4"><input class="form-control" placeholder="Nom utilisateur" [(ngModel)]="nouveau.username"></div><div class="col-md-4"><input class="form-control" type="password" placeholder="Mot de passe" [(ngModel)]="nouveau.password"></div>
    <div class="col-md-4"><select class="form-select" [(ngModel)]="nouveau.role"><option value="EMPLOYE">Employé simple</option><option value="MEDECIN">Médecin</option></select></div><div class="col-12"><button class="btn btn-success" (click)="creer()">Enregistrer</button></div>
  </div></div>
  <div class="card"><div class="table-responsive"><table class="table mb-0 align-middle"><thead><tr><th>Nom</th><th>Type</th><th>Profession</th><th>Email</th><th>Taux horaire</th><th>Téléphone</th><th class="text-end">Actions</th></tr></thead><tbody><tr *ngFor="let e of employes"><td>{{ e.prenom }} {{ e.nom }} <span class="badge bg-secondary ms-1" *ngIf="!e.actif">Inactif</span></td><td>{{ libelleRole(e.role) }}</td><td>{{ e.profession || '-' }}</td><td>{{ e.email || '-' }}</td><td>{{ e.tauxHoraire ? (e.tauxHoraire | number:'1.0-0') + ' FCFA' : '-' }}</td><td>{{ e.telephone || '-' }}</td>
    <td class="text-end text-nowrap">
      <button class="btn btn-sm btn-outline-secondary me-1" title="Détail" (click)="ouvrir('detail', e)"><i class="bi bi-eye"></i></button>
      <button class="btn btn-sm btn-outline-primary me-1" title="Modifier" (click)="ouvrir('modification', e)"><i class="bi bi-pencil"></i></button>
      <button class="btn btn-sm btn-outline-danger" title="Supprimer" (click)="ouvrir('suppression', e)"><i class="bi bi-trash"></i></button>
    </td></tr></tbody></table></div></div>
  <div class="d-flex justify-content-between align-items-center mt-3"><small>Page {{ page + 1 }} / {{ totalPages || 1 }} ({{ totalElements }} employés)</small><div><button class="btn btn-sm btn-outline-secondary me-2" [disabled]="page === 0" (click)="charger(page - 1)">Précédent</button><button class="btn btn-sm btn-outline-secondary" [disabled]="page + 1 >= totalPages" (click)="charger(page + 1)">Suivant</button></div></div>

  <div class="popup-fond" *ngIf="popup && selection" (click)="fermer()">
    <div class="popup" [class.popup-petit]="popup === 'suppression'" role="dialog" aria-modal="true" (click)="$event.stopPropagation()">
      <div class="popup-entete">
        <h5 class="mb-0" *ngIf="popup === 'detail'"><i class="bi bi-person-vcard"></i> Détail de l'employé</h5>
        <h5 class="mb-0" *ngIf="popup === 'modification'"><i class="bi bi-pencil-square"></i> Modifier l'employé</h5>
        <h5 class="mb-0" *ngIf="popup === 'suppression'"><i class="bi bi-exclamation-triangle text-danger"></i> Supprimer l'employé</h5>
        <button type="button" class="btn-close" aria-label="Fermer" (click)="fermer()"></button>
      </div>

      <div class="popup-corps">
        <div class="alert alert-danger py-2" *ngIf="erreur">{{ erreur }}</div>

        <dl class="row mb-0" *ngIf="popup === 'detail'">
          <dt class="col-sm-5">Nom complet</dt><dd class="col-sm-7">{{ selection.prenom }} {{ selection.nom }}</dd>
          <dt class="col-sm-5">Nom utilisateur</dt><dd class="col-sm-7">{{ selection.username }}</dd>
          <dt class="col-sm-5">Type</dt><dd class="col-sm-7">{{ libelleRole(selection.role) }}</dd>
          <dt class="col-sm-5">Statut</dt><dd class="col-sm-7"><span class="badge" [class.bg-success]="selection.actif" [class.bg-secondary]="!selection.actif">{{ selection.actif ? 'Actif' : 'Inactif' }}</span></dd>
          <dt class="col-sm-5">Profession</dt><dd class="col-sm-7">{{ selection.profession || '-' }}</dd>
          <dt class="col-sm-5">Email</dt><dd class="col-sm-7 text-break">{{ selection.email || '-' }}</dd>
          <dt class="col-sm-5">Téléphone</dt><dd class="col-sm-7">{{ selection.telephone || '-' }}</dd>
          <dt class="col-sm-5">Expérience</dt><dd class="col-sm-7">{{ selection.anneesExperience != null ? selection.anneesExperience + ' an(s)' : '-' }}</dd>
          <dt class="col-sm-5">Taux horaire</dt><dd class="col-sm-7">{{ selection.tauxHoraire ? (selection.tauxHoraire | number:'1.0-0') + ' FCFA' : '-' }}</dd>
          <dt class="col-sm-5">Créé le</dt><dd class="col-sm-7">{{ selection.dateCreation ? (selection.dateCreation | date:'dd/MM/yyyy HH:mm') : '-' }}</dd>
        </dl>

        <div class="row g-2" *ngIf="popup === 'modification'">
          <div class="col-sm-6"><label class="form-label small">Nom</label><input class="form-control" [(ngModel)]="edition.nom"></div>
          <div class="col-sm-6"><label class="form-label small">Prénom</label><input class="form-control" [(ngModel)]="edition.prenom"></div>
          <div class="col-sm-6"><label class="form-label small">Email</label><input class="form-control" type="email" [(ngModel)]="edition.email"></div>
          <div class="col-sm-6"><label class="form-label small">Téléphone</label><input class="form-control" [(ngModel)]="edition.telephone"></div>
          <div class="col-sm-6"><label class="form-label small">Profession</label><input class="form-control" [(ngModel)]="edition.profession"></div>
          <div class="col-sm-6"><label class="form-label small">Expérience (années)</label><input class="form-control" type="number" min="0" [(ngModel)]="edition.anneesExperience"></div>
          <div class="col-sm-6"><label class="form-label small">Taux horaire (FCFA)</label><input class="form-control" type="number" min="0" [(ngModel)]="edition.tauxHoraire"></div>
          <div class="col-sm-6"><label class="form-label small">Type</label>
            <select class="form-select" [(ngModel)]="edition.role"><option *ngFor="let r of roles" [value]="r">{{ libelleRole(r) }}</option></select></div>
          <div class="col-sm-6"><label class="form-label small">Nom utilisateur</label><input class="form-control" [value]="edition.username" disabled></div>
          <div class="col-sm-6"><label class="form-label small">Nouveau mot de passe</label><input class="form-control" type="password" placeholder="Laisser vide pour ne pas changer" [(ngModel)]="edition.password" autocomplete="new-password"></div>
          <div class="col-12"><div class="form-check form-switch"><input class="form-check-input" type="checkbox" id="employe-actif" [(ngModel)]="edition.actif"><label class="form-check-label" for="employe-actif">Compte actif</label></div></div>
        </div>

        <p class="mb-0" *ngIf="popup === 'suppression'">Voulez-vous vraiment supprimer <strong>{{ selection.prenom }} {{ selection.nom }}</strong> ? Cette action est irréversible.</p>
      </div>

      <div class="popup-pied">
        <button class="btn btn-outline-secondary" (click)="fermer()">{{ popup === 'detail' ? 'Fermer' : 'Annuler' }}</button>
        <button class="btn btn-primary" *ngIf="popup === 'detail'" (click)="ouvrir('modification', selection)"><i class="bi bi-pencil"></i> Modifier</button>
        <button class="btn btn-success" *ngIf="popup === 'modification'" [disabled]="enCours" (click)="enregistrer()">
          <span *ngIf="enCours" class="spinner-border spinner-border-sm me-1"></span>Enregistrer</button>
        <button class="btn btn-danger" *ngIf="popup === 'suppression'" [disabled]="enCours" (click)="supprimer()">
          <span *ngIf="enCours" class="spinner-border spinner-border-sm me-1"></span>Supprimer</button>
      </div>
    </div>
  </div>
`, styles: [`
  /* Le fond ne couvre que la zone de contenu : sur grand écran il commence après le sidebar (276px). */
  .popup-fond { position: fixed; inset: 0; z-index: 1040; display: flex; align-items: center; justify-content: center; padding: 1rem; background: rgba(15, 35, 28, .45); }
  @media (min-width: 992px) and (hover: hover), (min-width: 992px) and (pointer: fine) { .popup-fond { left: 276px; } }
  /* Le popup ne dépasse jamais la hauteur de l'écran : seul son corps défile. */
  .popup { display: flex; flex-direction: column; width: min(640px, 100%); max-height: calc(100dvh - 2rem); border-radius: 12px; background: #fff; box-shadow: 0 18px 45px rgba(0, 0, 0, .2); }
  .popup-petit { width: min(440px, 100%); }
  .popup-entete, .popup-pied { display: flex; align-items: center; gap: .5rem; flex-shrink: 0; padding: .9rem 1.1rem; }
  .popup-entete { justify-content: space-between; border-bottom: 1px solid #e9ecef; }
  .popup-pied { justify-content: flex-end; flex-wrap: wrap; border-top: 1px solid #e9ecef; }
  .popup-corps { flex: 1 1 auto; min-height: 0; overflow-y: auto; padding: 1.1rem; }
  dd { margin-bottom: .5rem; }
  /* Sur smartphone, le popup s'ouvre comme une feuille qui glisse depuis le bas de l'écran. */
  @media (max-width: 767.98px) {
    .popup-fond { z-index: 1045; align-items: flex-end; padding: 0; animation: popup-fondu .2s ease; }
    .popup, .popup-petit { width: 100%; max-height: calc(100dvh - 2.5rem - env(safe-area-inset-top)); border-radius: 18px 18px 0 0; animation: popup-glisse .28s cubic-bezier(.2, .8, .2, 1); }
    .popup-entete { position: relative; padding-top: 1.35rem; }
    .popup-entete::before { position: absolute; top: .5rem; left: 50%; width: 40px; height: 4px; border-radius: 2px; content: ''; background: #d5ded9; transform: translateX(-50%); }
    .popup-pied { padding-bottom: calc(.9rem + env(safe-area-inset-bottom)); }
    .popup-pied .btn { flex: 1 1 auto; }
  }
  @keyframes popup-glisse { from { transform: translateY(100%); } to { transform: none; } }
  @keyframes popup-fondu { from { opacity: 0; } to { opacity: 1; } }
`] })
export class EmployesComponent implements OnInit {
  employes: Utilisateur[] = []; page = 0; totalPages = 0; totalElements = 0; formulaire = false; nouveau: any = { role: 'EMPLOYE', actif: true };
  roles = Object.keys(LIBELLES_ROLE) as Role[];
  popup: Popup | null = null; selection: Utilisateur | null = null; edition: any = {};
  erreur = ''; message = ''; enCours = false;
  constructor(private service: ComptabiliteService) {}
  ngOnInit(): void { this.charger(0); }
  charger(page: number): void { this.page = page; this.service.employesPage(page, 8).subscribe(result => { this.employes = result.content; this.totalPages = result.totalPages; this.totalElements = result.totalElements; }); }
  creer(): void { this.service.creerEmploye(this.nouveau).subscribe(() => { this.nouveau = { role: 'EMPLOYE', actif: true }; this.formulaire = false; this.charger(this.page); }); }
  libelleRole(role: Role): string { return LIBELLES_ROLE[role] ?? role; }

  ouvrir(type: Popup, e: Utilisateur): void {
    this.popup = type; this.selection = e; this.erreur = ''; this.message = '';
    if (type === 'modification') this.edition = { ...e, password: '' };
  }

  @HostListener('document:keydown.escape')
  fermer(): void { if (!this.enCours) { this.popup = null; this.selection = null; this.erreur = ''; } }

  enregistrer(): void {
    if (!this.selection) return;
    const { id, dateCreation, ...donnees } = this.edition;
    this.executer(this.service.modifierEmploye(this.selection.id, donnees), 'Employé modifié.', this.page);
  }

  supprimer(): void {
    if (!this.selection) return;
    // Si on supprime le dernier employé de la page, on revient à la page précédente.
    const page = this.employes.length === 1 && this.page > 0 ? this.page - 1 : this.page;
    this.executer(this.service.supprimerEmploye(this.selection.id), 'Employé supprimé.', page);
  }

  private executer(action: Observable<unknown>, succes: string, page: number): void {
    this.enCours = true; this.erreur = '';
    action.subscribe({
      next: () => { this.enCours = false; this.fermer(); this.message = succes; this.charger(page); },
      error: err => { this.enCours = false; this.erreur = err?.error?.message || 'Une erreur est survenue.'; }
    });
  }
}
