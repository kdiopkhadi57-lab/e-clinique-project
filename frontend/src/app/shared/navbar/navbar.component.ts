import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Notification } from '../../core/models/notification.model';
import { NotificationService } from '../../core/services/notification.service';
import { NotificationSoundService } from '../../core/services/notification-sound.service';
import { interval, Subscription } from 'rxjs';
import { TraduirePipe } from '../../core/i18n/traduire.pipe';
import { MiseEnPageService } from '../../core/services/mise-en-page.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TraduirePipe],
  template: `
    <ng-container *ngIf="auth.isAuthenticated()">
      <div class="sidebar-backdrop no-print" *ngIf="miseEnPage.menuOuvert()" (click)="fermerMenu()"></div>

      <aside class="sidebar-eclinique no-print" [class.open]="miseEnPage.menuOuvert()">
        <div class="sidebar-brand">
          <a routerLink="/dashboard" (click)="fermerMenu()">
            <img class="brand-mark" src="assets/logo-embleme-sombre.png" alt="Logo Cabinet Médical Demba Bodiel SY">
            <span>
              <strong>Demba Bodiel SY</strong>
              <small>{{ 'nav.backoffice' | t }}</small>
            </span>
          </a>
          <button type="button" class="sidebar-close" (click)="fermerMenu()" [attr.aria-label]="'nav.fermerMenu' | t">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="sidebar-section-label">{{ 'nav.navigation' | t }}</div>
        <nav class="sidebar-nav" aria-label="Navigation principale">
          <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="fermerMenu()">
            <i class="bi bi-grid-1x2-fill"></i><span>{{ 'nav.dashboard' | t }}</span>
          </a>
          <a routerLink="/patients" routerLinkActive="active" (click)="fermerMenu()">
            <i class="bi bi-people-fill"></i><span>{{ 'nav.patients' | t }}</span>
          </a>
          <a *ngIf="auth.hasRole('RECEPTIONNISTE')" routerLink="/tickets" routerLinkActive="active" (click)="fermerMenu()">
            <i class="bi bi-ticket-perforated-fill"></i><span>{{ 'nav.tickets' | t }}</span>
          </a>
          <a routerLink="/consultations" routerLinkActive="active" (click)="fermerMenu()">
            <i class="bi bi-journal-medical"></i><span>{{ 'nav.consultations' | t }}</span>
          </a>
          <a routerLink="/rendezvous" routerLinkActive="active" (click)="fermerMenu()">
            <i class="bi bi-calendar2-check-fill"></i><span>{{ 'nav.rendezvous' | t }}</span>
          </a>
          <a routerLink="/factures" routerLinkActive="active" (click)="fermerMenu()">
            <i class="bi bi-receipt-cutoff"></i><span>{{ 'nav.factures' | t }}</span>
          </a>
          <a *ngIf="auth.hasRole('ADMIN','RECEPTIONNISTE')" routerLink="/factures-organismes" routerLinkActive="active" (click)="fermerMenu()">
            <i class="bi bi-building-check"></i><span>{{ 'nav.facturesOrganismes' | t }}</span>
          </a>
          <a routerLink="/hospitalisations" routerLinkActive="active" (click)="fermerMenu()">
            <i class="bi bi-hospital-fill"></i><span>{{ 'nav.hospitalisation' | t }}</span>
          </a>
          <a *ngIf="auth.hasRole('ADMIN','PHARMACIEN')" routerLink="/pharmacie" routerLinkActive="active" (click)="fermerMenu()">
            <i class="bi bi-capsule-pill"></i><span>{{ 'nav.pharmacie' | t }}</span>
          </a>
          <div *ngIf="auth.hasRole('RECEPTIONNISTE')" class="notification-panel">
            <button type="button" class="notification-button" (click)="notificationsOuvertes = !notificationsOuvertes">
              <i class="bi bi-exclamation-triangle-fill"></i><span>{{ 'nav.documentsImprimer' | t }}</span>
              <span class="notification-badge" *ngIf="nonLues > 0">{{ nonLues }}</span>
            </button>
            <div class="notification-list" *ngIf="notificationsOuvertes">
              <button type="button" class="notification-item" *ngFor="let notification of notificationsPage" [class.unread]="!notification.lue" (click)="ouvrirNotification(notification)">
                <i class="bi" [class.bi-printer]="notification.type === 'CONSULTATION' || notification.type === 'PATIENT_CONSULTATION'" [class.bi-receipt]="notification.type === 'FACTURE'" [class.bi-calendar-check]="notification.type === 'PATIENT_RENDEZVOUS'"></i>
                <span>{{ notification.message }}<small>{{ notification.dateCreation | date:'dd/MM/yyyy HH:mm' }}</small></span>
              </button>
              <p class="notification-empty" *ngIf="notifications.length === 0">{{ 'nav.aucunTicket' | t }}</p>
              <div class="notification-pagination" *ngIf="ticketTotalPages > 1">
                <button type="button" (click)="ticketPage = ticketPage - 1" [disabled]="ticketPage === 1">‹</button>
                <span>{{ ticketPage }} / {{ ticketTotalPages }}</span>
                <button type="button" (click)="ticketPage = ticketPage + 1" [disabled]="ticketPage === ticketTotalPages">›</button>
              </div>
            </div>
          </div>
          <a *ngIf="auth.hasRole('ADMIN')" routerLink="/audit" routerLinkActive="active" (click)="fermerMenu()">
            <i class="bi bi-shield-check"></i><span>{{ 'nav.audit' | t }}</span>
          </a>
          <a *ngIf="auth.hasRole('ADMIN')" routerLink="/comptabilite" routerLinkActive="active" (click)="fermerMenu()">
            <i class="bi bi-calculator"></i><span>{{ 'nav.comptabilite' | t }}</span>
          </a>
          <a *ngIf="auth.hasRole('ADMIN','RECEPTIONNISTE')" routerLink="/organismes" routerLinkActive="active" (click)="fermerMenu()">
            <i class="bi bi-building"></i><span>{{ 'nav.organismes' | t }}</span>
          </a>
          <a *ngIf="auth.hasRole('ADMIN')" routerLink="/employes" routerLinkActive="active" (click)="fermerMenu()">
            <i class="bi bi-person-badge"></i><span>{{ 'nav.employes' | t }}</span>
          </a>
        </nav>

      </aside>

      <!-- Barre d'onglets façon application mobile (smartphones et tablettes) -->
      <nav class="tabbar no-print" aria-label="Navigation rapide">
        <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
          <i class="bi bi-grid-1x2"></i><span>{{ 'nav.accueil' | t }}</span>
        </a>
        <a routerLink="/patients" routerLinkActive="active">
          <i class="bi bi-people"></i><span>{{ 'nav.patients' | t }}</span>
        </a>
        <a routerLink="/rendezvous" routerLinkActive="active">
          <i class="bi bi-calendar2-check"></i><span>{{ 'nav.rdvCourt' | t }}</span>
        </a>
        <a routerLink="/consultations" routerLinkActive="active">
          <i class="bi bi-journal-medical"></i><span>{{ 'nav.consultations' | t }}</span>
        </a>
        <button type="button" [class.active]="miseEnPage.menuOuvert()" (click)="miseEnPage.basculerMenu()"
                [attr.aria-expanded]="miseEnPage.menuOuvert()" [attr.aria-label]="'nav.ouvrirMenu' | t">
          <i class="bi bi-list"></i><span>{{ 'nav.menu' | t }}</span>
          <span class="tab-badge" *ngIf="nonLues > 0">{{ nonLues }}</span>
        </button>
      </nav>
    </ng-container>
  `
  ,
  styles: [`
    .sidebar-eclinique {
      position: fixed;
      inset: 0 auto 0 0;
      z-index: 1030;
      display: flex;
      flex-direction: column;
      width: 276px;
      padding: 1.5rem 1rem 1rem;
      color: #e9fff5;
      background: linear-gradient(165deg, #0b513b 0%, #07392d 100%);
      box-shadow: 12px 0 30px rgba(7, 57, 45, 0.12);
    }

    .sidebar-brand { padding: 0 .75rem 1.75rem; }
    .sidebar-brand a { display: flex; align-items: center; gap: .75rem; color: #fff; text-decoration: none; }
    .brand-mark { flex-shrink: 0; width: 46px; height: 46px; object-fit: contain; }
    .sidebar-brand strong, .sidebar-brand small, .user-details strong, .user-details small { display: block; }
    .sidebar-brand strong { font-size: 1.1rem; letter-spacing: .01em; }
    .sidebar-brand small { margin-top: .15rem; color: #a8d6bf; font-size: .72rem; }
    .sidebar-section-label { padding: 0 .75rem .65rem; color: #87bda7; font-size: .68rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
    .sidebar-nav { display: grid; gap: .35rem; }
    .sidebar-nav a, .logout-button { display: flex; align-items: center; gap: .8rem; min-height: 46px; padding: .7rem .8rem; border: 0; border-radius: 9px; color: #c4e6d4; background: transparent; font-size: .91rem; text-decoration: none; transition: background-color .2s ease, color .2s ease, transform .2s ease; }
    .sidebar-nav a i, .logout-button i { width: 20px; color: #8edbb3; font-size: 1.05rem; text-align: center; }
    .sidebar-nav a:hover, .sidebar-nav a.active { color: #fff; background: rgba(168, 230, 197, .15); }
    .sidebar-nav a.active { box-shadow: inset 3px 0 #a8e6c5; }
    .sidebar-nav a:hover { transform: translateX(2px); }
    .notification-panel { position: relative; }
    .notification-button { display: flex; align-items: center; gap: .8rem; width: 100%; min-height: 46px; padding: .7rem .8rem; border: 0; border-radius: 9px; color: #c4e6d4; background: transparent; cursor: pointer; text-align: left; }
    .notification-button:hover { color: #fff; background: rgba(168, 230, 197, .15); }
    .notification-button i { width: 20px; color: #ffd166; text-align: center; }
    .notification-badge { margin-left: auto; min-width: 22px; padding: .15rem .4rem; border-radius: 10px; color: #fff; background: #dc3545; font-size: .72rem; text-align: center; }
    .notification-list { position: absolute; left: 100%; bottom: 0; z-index: 2; width: 320px; padding: .4rem; border-radius: 8px; background: #fff; box-shadow: 0 8px 24px rgba(0,0,0,.2); }
    .notification-item { display: flex; gap: .6rem; width: 100%; padding: .65rem; border: 0; border-bottom: 1px solid #e9ecef; color: #243b32; background: #fff; text-align: left; }
    .notification-item.unread { background: #fff8e1; }
    .notification-item i { color: #d39e00; }
    .notification-item small { display: block; margin-top: .2rem; color: #6c757d; }
    .notification-empty { margin: .5rem; color: #6c757d; font-size: .85rem; }
    .notification-pagination { display: flex; align-items: center; justify-content: center; gap: .65rem; padding: .45rem; border-top: 1px solid #e9ecef; color: #52635c; font-size: .8rem; }
    .notification-pagination button { width: 25px; height: 25px; border: 1px solid #ced4da; border-radius: 4px; color: #0b513b; background: #fff; }
    .sidebar-footer { margin-top: auto; padding-top: 1rem; border-top: 1px solid rgba(168, 230, 197, .18); }
    .user-summary { display: flex; align-items: center; gap: .7rem; padding: .6rem .65rem 1rem; }
    .user-avatar { display: grid; place-items: center; width: 35px; height: 35px; color: #07513a; background: #d1f3df; border-radius: 50%; }
    .user-details { min-width: 0; }
    .user-details strong { overflow: hidden; color: #fff; font-size: .82rem; text-overflow: ellipsis; white-space: nowrap; }
    .user-details small { margin-top: .15rem; color: #8edbb3; font-size: .7rem; }
    .logout-button { width: 100%; color: #b9dccc; cursor: pointer; text-align: left; }
    .logout-button:hover { color: #fff; background: rgba(255, 255, 255, .08); }
    .sidebar-backdrop, .sidebar-close, .tabbar { display: none; }

    @media (max-width: 991.98px), (hover: none) and (pointer: coarse) {
      .sidebar-eclinique { width: min(300px, 86vw); padding-top: calc(1.25rem + env(safe-area-inset-top)); padding-bottom: calc(5.5rem + env(safe-area-inset-bottom)); overflow-y: auto; overscroll-behavior: contain; transform: translateX(-100%); transition: transform .28s cubic-bezier(.2, .8, .2, 1); }
      .sidebar-eclinique.open { transform: translateX(0); box-shadow: 18px 0 40px rgba(3, 30, 23, .3); }
      .sidebar-brand { display: flex; align-items: center; justify-content: space-between; gap: .5rem; padding-bottom: 1.25rem; }
      .sidebar-close { display: grid; place-items: center; flex-shrink: 0; width: 38px; height: 38px; border: 0; border-radius: 50%; color: #fff; background: rgba(255, 255, 255, .1); }
      .sidebar-nav a:hover { transform: none; }
      .sidebar-backdrop { position: fixed; inset: 0; z-index: 1025; display: block; background: rgba(3, 30, 23, .45); animation: fondu .2s ease; }
      .notification-list { position: static; width: auto; margin-top: .35rem; }

      .tabbar { position: fixed; inset: auto 0 0 0; z-index: 1035; display: grid; grid-template-columns: repeat(5, 1fr); padding: .3rem .25rem calc(.3rem + env(safe-area-inset-bottom)); border-top: 1px solid rgba(11, 81, 59, .1); background: rgba(255, 255, 255, .94); backdrop-filter: saturate(180%) blur(16px); -webkit-backdrop-filter: saturate(180%) blur(16px); box-shadow: 0 -6px 20px rgba(7, 57, 45, .06); }
      .tabbar a, .tabbar button { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .1rem; min-height: 52px; padding: .25rem 0; border: 0; border-radius: 12px; color: #6b7d75; background: transparent; font-size: .66rem; font-weight: 600; text-decoration: none; -webkit-tap-highlight-color: transparent; user-select: none; }
      .tabbar i { font-size: 1.3rem; line-height: 1; transition: transform .2s ease; }
      .tabbar span { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .tabbar .active { color: #0b7a53; }
      .tabbar .active i { transform: translateY(-1px) scale(1.08); }
      .tabbar .active::before { position: absolute; top: 0; width: 28px; height: 3px; border-radius: 0 0 3px 3px; content: ''; background: #0b7a53; }
      .tabbar a:active, .tabbar button:active { background: rgba(11, 122, 83, .08); }
      .tab-badge { position: absolute; top: 4px; left: calc(50% + 6px); min-width: 18px; padding: 0 .3rem; border-radius: 9px; color: #fff; background: #dc3545; font-size: .62rem; line-height: 18px; text-align: center; }
    }

    /* Tablettes (iPad, Android) : onglets centrés et plus lisibles, comme dans les applications iPadOS. */
    @media (min-width: 768px) and (max-width: 991.98px), (min-width: 768px) and (hover: none) and (pointer: coarse) {
      .tabbar { grid-template-columns: repeat(5, minmax(0, 140px)); justify-content: center; gap: .5rem; }
      .tabbar a, .tabbar button { min-height: 56px; font-size: .78rem; }
      .tabbar i { font-size: 1.4rem; }
    }

    @keyframes fondu { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class NavbarComponent implements OnInit, OnDestroy {
  notificationsOuvertes = false;
  notifications: Notification[] = [];
  nonLues = 0;
  ticketPage = 1;
  readonly ticketPageSize = 5;
  private notificationsSubscription?: Subscription;
  private notificationsInitialisees = false;

  constructor(public auth: AuthService, public miseEnPage: MiseEnPageService, private router: Router, private notificationService: NotificationService,
              private notificationSoundService: NotificationSoundService) {}

  ngOnInit(): void {
    if (this.auth.hasRole('ADMIN','MEDECIN','RECEPTIONNISTE')) {
      this.chargerNotifications();
      this.notificationsSubscription = interval(10000).subscribe(() => this.chargerNotifications());
    }
  }

  ngOnDestroy(): void {
    this.notificationsSubscription?.unsubscribe();
  }

  chargerNotifications(): void {
    this.notificationService.findAll().subscribe((notifications) => {
      const nouvellesAlertes = notifications.filter((notification) =>
        !notification.lue && this.estNotificationSonore(notification) &&
        !this.notifications.some((ancienne) => ancienne.id === notification.id));
      if (this.notificationsInitialisees && nouvellesAlertes.length > 0) {
        this.notificationSoundService.play();
      }
      this.notificationsInitialisees = true;
      this.notifications = notifications.filter((notification) =>
        notification.type === 'CONSULTATION' || notification.type === 'FACTURE' ||
        notification.type === 'PATIENT_CONSULTATION' || notification.type === 'PATIENT_RENDEZVOUS');
      this.ticketPage = 1;
      this.nonLues = this.notifications.filter((notification) => !notification.lue).length;
    });
  }

  private estNotificationSonore(notification: Notification): boolean {
    return this.auth.hasRole('MEDECIN')
      ? notification.type === 'PATIENT_CONSULTATION' || notification.type === 'PATIENT_RENDEZVOUS'
      : this.auth.hasRole('RECEPTIONNISTE') &&
        (notification.type === 'CONSULTATION' || notification.type === 'FACTURE');
  }

  get ticketTotalPages(): number { return Math.max(1, Math.ceil(this.notifications.length / this.ticketPageSize)); }
  get notificationsPage(): Notification[] {
    const start = (this.ticketPage - 1) * this.ticketPageSize;
    return this.notifications.slice(start, start + this.ticketPageSize);
  }

  ouvrirNotification(notification: Notification): void {
    if (!notification.lue) {
      this.notificationService.marquerLue(notification.id).subscribe(() => this.chargerNotifications());
    }
    this.notificationsOuvertes = false;
    if (notification.type === 'FACTURE' && notification.factureId) {
      this.router.navigate(['/factures', notification.factureId]);
    } else if (notification.type === 'CONSULTATION' && notification.consultationId) {
      this.router.navigate(['/consultations', notification.consultationId, 'ticket']);
    } else if (notification.type === 'PATIENT_CONSULTATION' || notification.type === 'PATIENT_RENDEZVOUS') {
      this.router.navigate(['/tickets']);
    } else {
      this.router.navigate(['/patients', notification.patientId]);
    }
  }

  fermerMenu(): void {
    this.miseEnPage.fermerMenu();
  }

}
