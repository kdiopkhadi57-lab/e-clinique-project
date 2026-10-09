import { AfterViewInit, Component, ElementRef, Input, NgZone, OnChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TraduirePipe } from '../../core/i18n/traduire.pipe';

export interface SerieGraphique {
  nom: string;
  /** Couleur de la marque uniquement : les textes restent dans les encres neutres. */
  couleur?: string;
  valeurs: number[];
}

interface Segment { x: number; y: number; largeur: number; hauteur: number; couleur: string; chemin: string; }

/**
 * Histogramme SVG sans dépendance : colonnes simples, groupées ou empilées, valeurs négatives
 * autorisées, info-bulle au survol et vue tableau pour l'accessibilité.
 */
@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule, TraduirePipe],
  template: `
    <figure class="viz">
      <figcaption class="viz-head">
        <div>
          <div class="viz-title">{{ titre }}</div>
          <div class="viz-subtitle" *ngIf="sousTitre">{{ sousTitre }}</div>
        </div>
        <button type="button" class="viz-toggle" (click)="vueTableau = !vueTableau">
          <i class="bi" [class.bi-table]="!vueTableau" [class.bi-bar-chart]="vueTableau"></i>
          {{ (vueTableau ? 'graph.graphique' : 'graph.tableau') | t }}
        </button>
      </figcaption>

      <div class="viz-legend" *ngIf="series.length > 1">
        <span *ngFor="let s of series"><i [style.background]="s.couleur"></i>{{ s.nom }}</span>
      </div>

      <div class="viz-plot" *ngIf="!vueTableau" (mouseleave)="survol = null">
        <svg [attr.viewBox]="'0 0 ' + L + ' ' + H" role="img" [attr.aria-label]="titre">
          <g *ngFor="let t of graduations">
            <line [attr.x1]="margeG" [attr.x2]="L - margeD" [attr.y1]="y(t)" [attr.y2]="y(t)"
                  [attr.class]="t === 0 ? 'axe' : 'grille'" />
            <text [attr.x]="margeG - 8" [attr.y]="y(t) + 4" text-anchor="end" class="tick">{{ compact(t) }}</text>
          </g>
          <g *ngFor="let lib of libelles; let i = index">
            <rect *ngIf="survol === i" class="survol" [attr.x]="bandeX(i)" [attr.y]="margeH" [attr.width]="bande" [attr.height]="H - margeH - margeB" />
            <path *ngFor="let seg of segments[i]" [attr.d]="seg.chemin" [attr.fill]="seg.couleur" />
            <text [attr.x]="bandeX(i) + bande / 2" [attr.y]="H - margeB + 18" text-anchor="middle" class="tick">{{ lib }}</text>
            <rect class="cible" [attr.x]="bandeX(i)" [attr.y]="margeH" [attr.width]="bande" [attr.height]="H - margeH - margeB + 22"
                  (mouseenter)="survoler(i, $event)" (mousemove)="survoler(i, $event)" (click)="survoler(i, $event)" />
          </g>
        </svg>
        <div class="viz-tip" *ngIf="survol !== null" [style.left.%]="tipX" [class.gauche]="tipX > 60">
          <strong>{{ libelles[survol] }}</strong>
          <div *ngFor="let s of series" class="ligne"><i [style.background]="s.couleur"></i><span>{{ s.nom }}</span><b>{{ s.valeurs[survol] | number:'1.0-0' }}</b></div>
          <div *ngIf="empile && series.length > 1" class="ligne total"><span>{{ 'graph.total' | t }}</span><b>{{ totalEmpile(survol) | number:'1.0-0' }}</b></div>
          <div *ngFor="let s of infos" class="ligne"><span>{{ s.nom }}</span><b>{{ s.valeurs[survol] | number:'1.0-0' }}</b></div>
          <small>{{ unite }}</small>
        </div>
      </div>

      <div class="table-responsive" *ngIf="vueTableau">
        <table class="table table-sm mb-0">
          <thead><tr><th>{{ 'graph.periode' | t }}</th><th class="text-end" *ngFor="let s of series">{{ s.nom }}</th>
            <th class="text-end" *ngIf="empile && series.length > 1">{{ 'graph.total' | t }}</th><th class="text-end" *ngFor="let s of infos">{{ s.nom }}</th></tr></thead>
          <tbody>
            <tr *ngFor="let lib of libelles; let i = index">
              <td>{{ lib }}</td>
              <td class="text-end" *ngFor="let s of series">{{ s.valeurs[i] | number:'1.0-0' }}</td>
              <td class="text-end" *ngIf="empile && series.length > 1"><strong>{{ totalEmpile(i) | number:'1.0-0' }}</strong></td>
              <td class="text-end" *ngFor="let s of infos">{{ s.valeurs[i] | number:'1.0-0' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </figure>
  `,
  styles: [`
    .viz { margin: 0; --ink: #1d332a; --ink-2: #5b6b64; --grid: #e7ece9; --axis: #b9c4bf; --surface: #fff; }
    .viz-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: .5rem; }
    .viz-title { color: var(--ink); font-weight: 600; }
    .viz-subtitle { color: var(--ink-2); font-size: .82rem; }
    .viz-toggle { border: 1px solid var(--grid); background: var(--surface); color: var(--ink-2); border-radius: 6px; font-size: .8rem; padding: .2rem .55rem; white-space: nowrap; }
    .viz-legend { display: flex; flex-wrap: wrap; gap: .9rem; margin-bottom: .4rem; color: var(--ink-2); font-size: .82rem; }
    .viz-legend i, .viz-tip i { display: inline-block; width: 10px; height: 10px; border-radius: 2px; margin-right: .35rem; vertical-align: -1px; }
    .viz-plot { position: relative; }
    :host { display: block; }
    svg { display: block; width: 100%; height: 260px; overflow: visible; }
    .grille { stroke: var(--grid); stroke-width: 1; vector-effect: non-scaling-stroke; }
    .axe { stroke: var(--axis); stroke-width: 1; vector-effect: non-scaling-stroke; }
    .tick { fill: var(--ink-2); font-size: 12px; font-variant-numeric: tabular-nums; }
    .survol { fill: #000; opacity: .04; }
    .cible { fill: transparent; cursor: pointer; }
    .viz-tip { position: absolute; top: 4px; transform: translateX(12px); min-width: 190px; padding: .5rem .65rem; border-radius: 8px;
      background: var(--surface); color: var(--ink); box-shadow: 0 6px 20px rgba(0,0,0,.14); font-size: .8rem; pointer-events: none; z-index: 2; }
    .viz-tip.gauche { transform: translateX(calc(-100% - 12px)); }
    .viz-tip .ligne { display: flex; align-items: center; gap: .25rem; margin-top: .2rem; }
    .viz-tip .ligne span { flex: 1; color: var(--ink-2); }
    .viz-tip .ligne b { font-variant-numeric: tabular-nums; }
    .viz-tip .total { border-top: 1px solid var(--grid); padding-top: .2rem; }
    .viz-tip small { color: var(--ink-2); }
  `]
})
export class BarChartComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() titre = '';
  @Input() sousTitre = '';
  @Input() unite = 'FCFA';
  @Input() libelles: string[] = [];
  @Input() series: SerieGraphique[] = [];
  /** Séries affichées seulement dans l'info-bulle et le tableau (pas de marque). */
  @Input() infos: SerieGraphique[] = [];
  @Input() empile = false;

  /** Largeur réelle du conteneur : le texte garde sa taille quelle que soit la largeur. */
  L = 720;
  readonly H = 260;
  readonly margeG = 56;
  readonly margeD = 8;
  readonly margeH = 10;
  readonly margeB = 28;

  bande = 0;
  graduations: number[] = [];
  segments: Segment[][] = [];
  survol: number | null = null;
  tipX = 0;
  vueTableau = false;
  private min = 0;
  private max = 1;

  private observateur?: ResizeObserver;

  constructor(private hote: ElementRef<HTMLElement>, private zone: NgZone) {}

  ngAfterViewInit(): void {
    this.observateur = new ResizeObserver((entrees) => {
      const largeur = Math.round(entrees[0].contentRect.width);
      if (largeur > 0 && largeur !== this.L) this.zone.run(() => { this.L = largeur; this.ngOnChanges(); });
    });
    this.observateur.observe(this.hote.nativeElement);
  }

  ngOnDestroy(): void { this.observateur?.disconnect(); }

  ngOnChanges(): void {
    const n = Math.max(this.libelles.length, 1);
    this.bande = (this.L - this.margeG - this.margeD) / n;
    const hauts = this.libelles.map((_, i) => this.empile
      ? this.series.reduce((s, serie) => s + Math.max(serie.valeurs[i] || 0, 0), 0)
      : Math.max(0, ...this.series.map(s => s.valeurs[i] || 0)));
    const bas = this.libelles.map((_, i) => Math.min(0, ...this.series.map(s => s.valeurs[i] || 0)));
    const { pas, haut, basArrondi } = this.echelle(Math.min(0, ...bas), Math.max(0, ...hauts));
    this.min = basArrondi;
    this.max = haut;
    this.graduations = [];
    for (let t = basArrondi; t <= haut + pas / 2; t += pas) this.graduations.push(Math.round(t));
    this.segments = this.libelles.map((_, i) => this.construireSegments(i));
  }

  y(v: number): number {
    const zone = this.H - this.margeH - this.margeB;
    return this.margeH + (this.max - v) / (this.max - this.min || 1) * zone;
  }

  bandeX(i: number): number { return this.margeG + i * this.bande; }

  totalEmpile(i: number): number { return this.series.reduce((s, serie) => s + (serie.valeurs[i] || 0), 0); }

  survoler(i: number, ev: MouseEvent): void {
    this.survol = i;
    const svg = (ev.target as SVGElement).ownerSVGElement;
    const rect = svg?.getBoundingClientRect();
    this.tipX = rect ? ((ev.clientX - rect.left) / rect.width) * 100 : 50;
  }

  compact(v: number): string {
    const a = Math.abs(v);
    if (a >= 1_000_000) return (v / 1_000_000).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' M';
    if (a >= 1_000) return (v / 1_000).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' k';
    return v.toLocaleString('fr-FR');
  }

  private construireSegments(i: number): Segment[] {
    const segs: Segment[] = [];
    const largeurMax = 24;
    const espace = 2;
    if (this.empile) {
      const largeur = Math.min(largeurMax, this.bande * 0.6);
      const x = this.bandeX(i) + (this.bande - largeur) / 2;
      let cumul = 0;
      const visibles = this.series.filter(s => (s.valeurs[i] || 0) > 0);
      visibles.forEach((s, k) => {
        const v = s.valeurs[i] || 0;
        const yBas = this.y(cumul) - (k > 0 ? espace / 2 : 0);
        const yHaut = this.y(cumul + v) + (k < visibles.length - 1 ? espace / 2 : 0);
        cumul += v;
        const hauteur = Math.max(yBas - yHaut, 0);
        segs.push({ x, y: yHaut, largeur, hauteur, couleur: s.couleur || '#2a78d6',
          chemin: this.colonne(x, yHaut, largeur, hauteur, k === visibles.length - 1, false) });
      });
    } else {
      const nb = this.series.length || 1;
      const largeur = Math.min(largeurMax, (this.bande * 0.7 - (nb - 1) * espace) / nb);
      const debut = this.bandeX(i) + (this.bande - (largeur * nb + espace * (nb - 1))) / 2;
      this.series.forEach((s, k) => {
        const v = s.valeurs[i] || 0;
        if (v === 0) return;
        const x = debut + k * (largeur + espace);
        const yHaut = this.y(Math.max(v, 0));
        const hauteur = Math.abs(this.y(v) - this.y(0));
        segs.push({ x, y: yHaut, largeur, hauteur, couleur: s.couleur || '#2a78d6',
          chemin: this.colonne(x, yHaut, largeur, hauteur, true, v < 0) });
      });
    }
    return segs;
  }

  /** Colonne carrée à la base, bout arrondi (4px) côté donnée. */
  private colonne(x: number, y: number, l: number, h: number, arrondi: boolean, versLeBas: boolean): string {
    const r = arrondi ? Math.min(4, l / 2, h) : 0;
    if (!versLeBas) {
      return `M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + l - r} Q${x + l},${y} ${x + l},${y + r} V${y + h} Z`;
    }
    return `M${x},${y} V${y + h - r} Q${x},${y + h} ${x + r},${y + h} H${x + l - r} Q${x + l},${y + h} ${x + l},${y + h - r} V${y} Z`;
  }

  private echelle(min: number, max: number): { pas: number; haut: number; basArrondi: number } {
    const etendue = (max - min) || 1000;
    const brut = etendue / 4;
    const puissance = Math.pow(10, Math.floor(Math.log10(brut)));
    const pas = [1, 2, 2.5, 5, 10].map(m => m * puissance).find(p => p >= brut) || puissance * 10;
    return { pas, haut: Math.ceil(max / pas) * pas || pas, basArrondi: Math.floor(min / pas) * pas };
  }
}
