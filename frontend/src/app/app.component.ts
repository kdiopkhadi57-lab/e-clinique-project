import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { TopbarComponent } from './shared/topbar/topbar.component';
import { AuthService } from './core/services/auth.service';
import { TableauxMobilesService } from './core/services/tableaux-mobiles.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgIf, NavbarComponent, TopbarComponent],
  template: `
    <app-navbar></app-navbar>
    <main class="app-content" [class.with-sidebar]="auth.isAuthenticated()">
      <app-topbar *ngIf="auth.isAuthenticated()"></app-topbar>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .app-content {
      min-height: 100vh;
      min-height: 100dvh;
      padding: 1.5rem;
      box-sizing: border-box;
    }

    .app-content:not(.with-sidebar) {
      min-height: 0;
      padding: 0;
    }

    @media (min-width: 992px) and (hover: hover), (min-width: 992px) and (pointer: fine) {
      .app-content.with-sidebar {
        margin-left: 276px;
      }
    }

    /* Smartphones et tablettes : marges réduites et place pour la barre d'onglets du bas. */
    @media (max-width: 991.98px), (hover: none) and (pointer: coarse) {
      /* Rien ne doit élargir la page : sinon le téléphone dézoome tout l'écran. */
      .app-content {
        overflow-x: clip;
        padding: 1rem max(1rem, env(safe-area-inset-right)) calc(5.5rem + env(safe-area-inset-bottom)) max(1rem, env(safe-area-inset-left));
      }
    }
  `]
})
export class AppComponent implements OnInit {
  constructor(public auth: AuthService, private tableauxMobiles: TableauxMobilesService) {}

  ngOnInit(): void {
    this.tableauxMobiles.demarrer();
  }
}
