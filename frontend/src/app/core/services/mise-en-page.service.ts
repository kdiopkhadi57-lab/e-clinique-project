import { Injectable, effect, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

/** État partagé de la mise en page : ouverture du menu latéral (tiroir sur mobile). */
@Injectable({ providedIn: 'root' })
export class MiseEnPageService {
  readonly menuOuvert = signal(false);

  constructor(router: Router) {
    router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => this.menuOuvert.set(false));
    // Empêche la page de défiler derrière le tiroir ouvert, comme dans une application native.
    effect(() => document.body.classList.toggle('menu-mobile-ouvert', this.menuOuvert()));
  }

  basculerMenu(): void { this.menuOuvert.update((ouvert) => !ouvert); }
  fermerMenu(): void { this.menuOuvert.set(false); }
}
