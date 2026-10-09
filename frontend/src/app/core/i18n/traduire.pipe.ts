import { Pipe, PipeTransform } from '@angular/core';
import { I18nService } from './i18n.service';
import { CleTraduction } from './fr';

/** Usage : {{ 'nav.patients' | t }}. Impur pour se mettre à jour au changement de langue. */
@Pipe({ name: 't', standalone: true, pure: false })
export class TraduirePipe implements PipeTransform {
  constructor(private i18n: I18nService) {}
  transform(cle: CleTraduction | string): string { return this.i18n.t(cle); }
}
