import { Injectable, NgZone } from '@angular/core';

/**
 * Recopie l'en-tête de colonne de chaque tableau dans l'attribut data-label de ses cellules.
 * Sur smartphone, la feuille de style s'en sert pour afficher chaque ligne comme une carte
 * « libellé : valeur », sans avoir à modifier les gabarits des écrans.
 */
@Injectable({ providedIn: 'root' })
export class TableauxMobilesService {
  private observateur?: MutationObserver;
  private planifie = false;

  constructor(private zone: NgZone) {}

  demarrer(): void {
    if (this.observateur || typeof MutationObserver === 'undefined') return;
    this.zone.runOutsideAngular(() => {
      this.observateur = new MutationObserver(() => this.planifier());
      this.observateur.observe(document.body, { childList: true, subtree: true, characterData: true });
      this.planifier();
    });
  }

  private planifier(): void {
    if (this.planifie) return;
    this.planifie = true;
    requestAnimationFrame(() => {
      this.planifie = false;
      document.querySelectorAll<HTMLTableElement>('.table-responsive > table.table').forEach((t) => this.etiqueter(t));
    });
  }

  private etiqueter(tableau: HTMLTableElement): void {
    const entetes = Array.from(tableau.querySelectorAll(':scope > thead > tr:last-child > th'))
      .flatMap((th) => Array((th as HTMLTableCellElement).colSpan || 1).fill(th.textContent?.trim() ?? ''));
    tableau.querySelectorAll(':scope > tbody > tr').forEach((ligne) => {
      let colonne = 0;
      Array.from(ligne.children).forEach((cellule) => {
        const libelle = entetes[colonne] ?? '';
        if (cellule.getAttribute('data-label') !== libelle) cellule.setAttribute('data-label', libelle);
        colonne += (cellule as HTMLTableCellElement).colSpan || 1;
      });
    });
  }
}
