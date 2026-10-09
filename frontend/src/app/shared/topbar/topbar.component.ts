import { Component, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { I18nService, Langue } from '../../core/i18n/i18n.service';
import { TraduirePipe } from '../../core/i18n/traduire.pipe';

/** Barre du haut : choix de la langue et menu du compte connecté. */
@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterLink, TraduirePipe],
  template: `
    <header class="topbar no-print">
      <a class="marque-mobile" routerLink="/dashboard">
        <img src="assets/logo-embleme.png" alt="">
        <span>Demba Bodiel SY</span>
      </a>

      <div class="langues" role="group" [attr.aria-label]="'langue.choisir' | t">
        <button type="button" *ngFor="let l of langues" (click)="i18n.changer(l)"
                [class.actif]="i18n.langue() === l" [attr.aria-pressed]="i18n.langue() === l"
                [attr.title]="('langue.' + l) | t">{{ l.toUpperCase() }}</button>
      </div>

      <div class="compte">
        <button type="button" class="compte-bouton" (click)="ouvert = !ouvert" [attr.aria-expanded]="ouvert"
                aria-haspopup="menu" [attr.aria-label]="'menu.compte' | t">
          <span class="avatar">{{ initiales }}</span>
          <span class="identite">
            <strong>{{ auth.currentUser()?.prenom }} {{ auth.currentUser()?.nom }}</strong>
            <small>{{ ('role.' + auth.currentUser()?.role) | t }}</small>
          </span>
          <i class="bi bi-chevron-down"></i>
        </button>

        <div class="menu" *ngIf="ouvert" role="menu">
          <div class="menu-entete">
            <span class="avatar grand">{{ initiales }}</span>
            <div>
              <strong>{{ auth.currentUser()?.prenom }} {{ auth.currentUser()?.nom }}</strong>
              <small>&#64;{{ auth.currentUser()?.username }}</small>
            </div>
          </div>
          <a role="menuitem" routerLink="/profil" (click)="ouvert = false"><i class="bi bi-person-gear"></i>{{ 'menu.profil' | t }}</a>
          <a role="menuitem" routerLink="/profil" [queryParams]="{ onglet: 'mot-de-passe' }" (click)="ouvert = false">
            <i class="bi bi-key"></i>{{ 'menu.motDePasse' | t }}</a>
          <button type="button" role="menuitem" class="deconnexion" (click)="deconnexion()">
            <i class="bi bi-box-arrow-right"></i>{{ 'menu.deconnexion' | t }}</button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .topbar { display: flex; justify-content: flex-end; align-items: center; gap: .75rem; margin: -.5rem 0 1rem; min-height: 46px; }
    .langues { display: inline-flex; padding: 3px; border-radius: 9px; background: #e3eee8; }
    .langues button { border: 0; padding: .3rem .6rem; border-radius: 7px; background: transparent; color: #3c5a4d; font-size: .78rem; font-weight: 700; letter-spacing: .04em; }
    .langues button.actif { background: #fff; color: #07513a; box-shadow: 0 1px 3px rgba(0,0,0,.12); }
    .compte { position: relative; }
    .compte-bouton { display: flex; align-items: center; gap: .6rem; padding: .3rem .6rem .3rem .3rem; border: 1px solid #dbe7e0; border-radius: 999px; background: #fff; color: #1d332a; }
    .compte-bouton:hover { border-color: #b7d6c5; }
    .avatar { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 50%; background: #0b7a53; color: #fff; font-size: .8rem; font-weight: 700; }
    .avatar.grand { width: 42px; height: 42px; font-size: .95rem; }
    .identite { display: flex; flex-direction: column; line-height: 1.15; text-align: left; }
    .identite strong { font-size: .85rem; }
    .identite small { color: #5b6b64; font-size: .72rem; }
    .compte-bouton .bi-chevron-down { color: #5b6b64; font-size: .75rem; }
    .menu { position: absolute; right: 0; top: calc(100% + 6px); z-index: 1040; width: 250px; padding: .4rem; border-radius: 12px; background: #fff; box-shadow: 0 12px 30px rgba(7,57,45,.18); }
    .menu-entete { display: flex; align-items: center; gap: .65rem; padding: .55rem .6rem .75rem; margin-bottom: .3rem; border-bottom: 1px solid #edf2ef; }
    .menu-entete strong, .menu-entete small { display: block; }
    .menu-entete small { color: #5b6b64; }
    .menu a, .menu button { display: flex; align-items: center; gap: .65rem; width: 100%; padding: .55rem .6rem; border: 0; border-radius: 8px; background: transparent; color: #1d332a; font-size: .9rem; text-align: left; text-decoration: none; }
    .menu a:hover, .menu button:hover { background: #f1f7f3; }
    .menu i { width: 18px; color: #0b7a53; }
    .menu .deconnexion { color: #b02a37; }
    .menu .deconnexion i { color: #b02a37; }
    .marque-mobile { display: none; }
    /* Sur smartphone et tablette, la barre devient l'en-tête fixe de l'application. */
    @media (max-width: 991.98px), (hover: none) and (pointer: coarse) {
      .topbar { position: sticky; top: 0; z-index: 1020; margin: -1rem calc(-1 * max(1rem, env(safe-area-inset-right))) 1rem calc(-1 * max(1rem, env(safe-area-inset-left))); padding: calc(.5rem + env(safe-area-inset-top)) max(1rem, env(safe-area-inset-right)) .5rem max(1rem, env(safe-area-inset-left)); border-bottom: 1px solid rgba(11, 81, 59, .08); background: rgba(243, 248, 245, .9); backdrop-filter: saturate(180%) blur(16px); -webkit-backdrop-filter: saturate(180%) blur(16px); }
      .marque-mobile { display: flex; align-items: center; gap: .5rem; min-width: 0; margin-right: auto; color: #07513a; font-weight: 700; text-decoration: none; }
      .marque-mobile img { width: 34px; height: 34px; object-fit: contain; }
      .marque-mobile span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .compte-bouton { padding: .2rem; }
      .compte-bouton .bi-chevron-down { display: none; }
      .identite { display: none; }
      .menu { position: fixed; top: calc(3.6rem + env(safe-area-inset-top)); right: .75rem; width: min(290px, calc(100vw - 1.5rem)); }
      .menu a, .menu button { min-height: 46px; }
    }
    @media (max-width: 359.98px) { .marque-mobile span { display: none; } }
  `]
})
export class TopbarComponent {
  ouvert = false;
  readonly langues: Langue[] = ['fr', 'en'];

  constructor(public auth: AuthService, public i18n: I18nService, private router: Router, private hote: ElementRef) {}

  get initiales(): string {
    const u = this.auth.currentUser();
    return ((u?.prenom?.[0] ?? '') + (u?.nom?.[0] ?? '')).toUpperCase() || '?';
  }

  @HostListener('document:click', ['$event'])
  fermerSiDehors(ev: MouseEvent): void {
    if (this.ouvert && !this.hote.nativeElement.contains(ev.target)) this.ouvert = false;
  }

  @HostListener('document:keydown.escape')
  fermer(): void { this.ouvert = false; }

  deconnexion(): void {
    this.ouvert = false;
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
