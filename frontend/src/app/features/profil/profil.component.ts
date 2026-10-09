import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfilService } from '../../core/services/profil.service';
import { Utilisateur } from '../../core/models/user.model';
import { TraduirePipe } from '../../core/i18n/traduire.pipe';
import { I18nService } from '../../core/i18n/i18n.service';

type Onglet = 'infos' | 'mot-de-passe';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TraduirePipe],
  template: `
    <h4 class="mb-3"><i class="bi bi-person-circle"></i> {{ 'profil.titre' | t }}</h4>

    <div class="row g-3">
      <div class="col-lg-4">
        <div class="card p-4 text-center h-100" *ngIf="utilisateur">
          <div class="avatar mx-auto mb-3">{{ initiales }}</div>
          <h5 class="mb-0">{{ utilisateur.prenom }} {{ utilisateur.nom }}</h5>
          <div class="text-muted mb-3">{{ ('role.' + utilisateur.role) | t }}</div>
          <dl class="text-start small mb-0">
            <dt>{{ 'profil.identifiant' | t }}</dt><dd>{{ utilisateur.username }}</dd>
            <dt>{{ 'profil.email' | t }}</dt><dd>{{ utilisateur.email || '-' }}</dd>
            <dt>{{ 'profil.telephone' | t }}</dt><dd>{{ utilisateur.telephone || '-' }}</dd>
            <dt>{{ 'profil.membreDepuis' | t }}</dt><dd class="mb-0">{{ utilisateur.dateCreation | date:'dd/MM/yyyy' }}</dd>
          </dl>
        </div>
      </div>

      <div class="col-lg-8">
        <div class="card p-4">
          <ul class="nav nav-tabs mb-4">
            <li class="nav-item"><button type="button" class="nav-link" [class.active]="onglet === 'infos'" (click)="choisir('infos')">
              <i class="bi bi-person-gear"></i> {{ 'profil.infos' | t }}</button></li>
            <li class="nav-item"><button type="button" class="nav-link" [class.active]="onglet === 'mot-de-passe'" (click)="choisir('mot-de-passe')">
              <i class="bi bi-key"></i> {{ 'profil.motDePasse' | t }}</button></li>
          </ul>

          <form *ngIf="onglet === 'infos'" [formGroup]="infos" (ngSubmit)="enregistrer()">
            <div class="row g-3">
              <div class="col-md-6"><label class="form-label" for="prenom">{{ 'profil.prenom' | t }} *</label>
                <input id="prenom" class="form-control" formControlName="prenom" autocomplete="given-name"></div>
              <div class="col-md-6"><label class="form-label" for="nom">{{ 'profil.nom' | t }} *</label>
                <input id="nom" class="form-control" formControlName="nom" autocomplete="family-name"></div>
              <div class="col-md-6"><label class="form-label" for="email">{{ 'profil.email' | t }}</label>
                <input id="email" type="email" class="form-control" formControlName="email" autocomplete="email"></div>
              <div class="col-md-6"><label class="form-label" for="tel">{{ 'profil.telephone' | t }}</label>
                <input id="tel" class="form-control" formControlName="telephone" placeholder="+221 77 123 45 67" autocomplete="tel"></div>
            </div>
            <div class="alert alert-success mt-3 mb-0" *ngIf="succesInfos">{{ 'profil.enregistre' | t }}</div>
            <div class="alert alert-danger mt-3 mb-0" *ngIf="erreurInfos">{{ erreurInfos | t }}</div>
            <button type="submit" class="btn btn-primary mt-3" [disabled]="infos.invalid || envoi">
              <i class="bi bi-save"></i> {{ 'profil.enregistrer' | t }}</button>
          </form>

          <form *ngIf="onglet === 'mot-de-passe'" [formGroup]="motDePasse" (ngSubmit)="changerMotDePasse()">
            <div class="row g-3" style="max-width: 460px">
              <div class="col-12"><label class="form-label" for="actuel">{{ 'profil.actuel' | t }} *</label>
                <input id="actuel" type="password" class="form-control" formControlName="actuel" autocomplete="current-password"></div>
              <div class="col-12"><label class="form-label" for="nouveau">{{ 'profil.nouveau' | t }} *</label>
                <input id="nouveau" type="password" class="form-control" formControlName="nouveau" autocomplete="new-password">
                <div class="form-text">{{ 'profil.regle' | t }}</div></div>
              <div class="col-12"><label class="form-label" for="confirmation">{{ 'profil.confirmation' | t }} *</label>
                <input id="confirmation" type="password" class="form-control" formControlName="confirmation" autocomplete="new-password">
                <div class="invalid-feedback d-block" *ngIf="motDePasse.hasError('differents') && motDePasse.controls.confirmation.touched">
                  {{ 'profil.differents' | t }}</div></div>
            </div>
            <div class="alert alert-success mt-3 mb-0" *ngIf="succesMotDePasse">{{ 'profil.change' | t }}</div>
            <div class="alert alert-danger mt-3 mb-0" *ngIf="erreurMotDePasse">{{ erreurMotDePasse | t }}</div>
            <button type="submit" class="btn btn-primary mt-3" [disabled]="motDePasse.invalid || envoi">
              <i class="bi bi-key"></i> {{ 'profil.changer' | t }}</button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .avatar { display: grid; place-items: center; width: 84px; height: 84px; border-radius: 50%; background: #0b7a53; color: #fff; font-size: 1.8rem; font-weight: 700; }
    dt { color: #5b6b64; font-weight: 500; }
    dd { margin-bottom: .6rem; }
    .nav-link { color: #3c5a4d; }
  `]
})
export class ProfilComponent implements OnInit {
  utilisateur?: Utilisateur;
  onglet: Onglet = 'infos';
  envoi = false;
  succesInfos = false;
  erreurInfos = '';
  succesMotDePasse = false;
  erreurMotDePasse = '';

  infos = this.fb.group({
    prenom: ['', Validators.required],
    nom: ['', Validators.required],
    email: ['', Validators.email],
    telephone: ['', Validators.pattern(/^$|\+?[0-9][0-9 .()\-]{7,20}$/)]
  });

  motDePasse = this.fb.group({
    actuel: ['', Validators.required],
    nouveau: ['', [Validators.required, Validators.minLength(8)]],
    confirmation: ['', Validators.required]
  }, { validators: (g: AbstractControl): ValidationErrors | null =>
      g.get('nouveau')?.value === g.get('confirmation')?.value ? null : { differents: true } });

  constructor(private fb: FormBuilder, private service: ProfilService, private route: ActivatedRoute,
              private router: Router, public i18n: I18nService) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((p) => (this.onglet = p.get('onglet') === 'mot-de-passe' ? 'mot-de-passe' : 'infos'));
    this.service.moi().subscribe((u) => {
      this.utilisateur = u;
      this.infos.patchValue({ prenom: u.prenom, nom: u.nom, email: u.email ?? '', telephone: u.telephone ?? '' });
    });
  }

  get initiales(): string {
    return ((this.utilisateur?.prenom?.[0] ?? '') + (this.utilisateur?.nom?.[0] ?? '')).toUpperCase();
  }

  choisir(onglet: Onglet): void {
    this.router.navigate([], { queryParams: onglet === 'infos' ? {} : { onglet } });
  }

  enregistrer(): void {
    this.envoi = true;
    this.succesInfos = false;
    this.erreurInfos = '';
    this.service.modifier(this.infos.getRawValue() as any).subscribe({
      next: (u) => { this.utilisateur = u; this.succesInfos = true; this.envoi = false; },
      error: (err) => {
        this.envoi = false;
        this.erreurInfos = err.status === 400
          ? (String(err.error?.message).includes('email') ? 'profil.emailUtilise' : 'profil.champsInvalides')
          : 'profil.erreur';
      }
    });
  }

  changerMotDePasse(): void {
    const { actuel, nouveau } = this.motDePasse.getRawValue();
    this.envoi = true;
    this.succesMotDePasse = false;
    this.erreurMotDePasse = '';
    this.service.changerMotDePasse(actuel!, nouveau!).subscribe({
      next: () => { this.envoi = false; this.succesMotDePasse = true; this.motDePasse.reset(); },
      error: (err) => {
        this.envoi = false;
        this.erreurMotDePasse = err.status === 400 ? 'profil.actuelIncorrect' : 'profil.erreur';
      }
    });
  }
}
