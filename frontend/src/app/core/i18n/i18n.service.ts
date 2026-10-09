import { Injectable, signal } from '@angular/core';
import { CleTraduction, FR } from './fr';
import { EN } from './en';

export type Langue = 'fr' | 'en';

const STORAGE_KEY = 'eclinique_langue';
const DICTIONNAIRES: Record<Langue, Record<CleTraduction, string>> = { fr: FR, en: EN };

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly langue = signal<Langue>(this.langueInitiale());

  constructor() { document.documentElement.lang = this.langue(); }

  t(cle: CleTraduction | string): string {
    return DICTIONNAIRES[this.langue()][cle as CleTraduction] ?? FR[cle as CleTraduction] ?? cle;
  }

  changer(langue: Langue): void {
    this.langue.set(langue);
    document.documentElement.lang = langue;
    try { localStorage.setItem(STORAGE_KEY, langue); } catch { /* stockage indisponible */ }
  }

  private langueInitiale(): Langue {
    try {
      const enregistree = localStorage.getItem(STORAGE_KEY);
      if (enregistree === 'fr' || enregistree === 'en') return enregistree;
    } catch { /* stockage indisponible */ }
    return navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'fr';
  }
}
