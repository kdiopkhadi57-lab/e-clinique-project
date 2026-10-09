import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EnvoiRequest, EnvoiService } from '../../core/services/envoi.service';

/** Formulaire d'envoi par e-mail : destinataires (pré-remplis avec le concerné) et message facultatif. */
@Component({
  selector: 'app-envoi-email',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="alert alert-warning py-2 mb-2" *ngIf="mailConfigure === false">
      <i class="bi bi-exclamation-triangle"></i> L'envoi d'e-mails n'est pas configuré sur le serveur
      (variables MAIL_HOST, MAIL_USERNAME, MAIL_PASSWORD).
    </div>
    <div class="row g-2">
      <div class="col-md-6">
        <label class="form-label small mb-1">Destinataire(s) *</label>
        <input class="form-control form-control-sm" [(ngModel)]="destinataires" [placeholder]="placeholder">
        <small class="text-muted">Plusieurs adresses : séparez-les par des virgules.</small>
      </div>
      <div class="col-md-6">
        <label class="form-label small mb-1">Message (facultatif)</label>
        <input class="form-control form-control-sm" [(ngModel)]="message" placeholder="Ajouté au texte de l'e-mail">
      </div>
    </div>
    <div class="d-flex gap-2 align-items-center mt-2">
      <button class="btn btn-sm btn-primary" (click)="envoyer.emit({ destinataires: destinataires.trim(), message: message.trim() })"
              [disabled]="enCours || !destinataires.trim() || mailConfigure === false">
        <span class="spinner-border spinner-border-sm me-1" *ngIf="enCours"></span>
        <i class="bi bi-send" *ngIf="!enCours"></i> {{ libelle }}
      </button>
      <button class="btn btn-sm btn-light border" (click)="annuler.emit()" [disabled]="enCours">Fermer</button>
    </div>
  `
})
export class EnvoiEmailComponent implements OnInit, OnChanges {
  @Input() destinatairesParDefaut = '';
  @Input() libelle = 'Envoyer';
  @Input() placeholder = 'adresse@exemple.sn';
  @Input() enCours = false;
  @Output() envoyer = new EventEmitter<EnvoiRequest>();
  @Output() annuler = new EventEmitter<void>();

  destinataires = '';
  message = '';
  mailConfigure: boolean | null = null;

  constructor(private envoiService: EnvoiService) {}

  ngOnInit(): void {
    this.envoiService.parametres().subscribe({ next: (p) => (this.mailConfigure = p.mailConfigure), error: () => {} });
  }

  ngOnChanges(): void {
    if (!this.destinataires) this.destinataires = this.destinatairesParDefaut || '';
  }
}
