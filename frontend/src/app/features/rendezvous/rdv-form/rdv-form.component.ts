import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientService } from '../../../core/services/patient.service';
import { UtilisateurService } from '../../../core/services/utilisateur.service';
import { RendezVousService } from '../../../core/services/rendezvous.service';
import { Patient } from '../../../core/models/patient.model';
import { Utilisateur } from '../../../core/models/user.model';

@Component({
  selector: 'app-rdv-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h4 class="mb-3"><i class="bi bi-calendar-plus"></i> Nouveau rendez-vous</h4>

    <div class="alert alert-danger" *ngIf="erreur">{{ erreur }}</div>

    <div class="card p-4">
      <form [formGroup]="form" (ngSubmit)="enregistrer()">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Patient *</label>
            <select class="form-select" formControlName="patientId">
              <option value="">-- Sélectionner un patient --</option>
              <option *ngFor="let p of patients" [value]="p.id">{{ p.prenom }} {{ p.nom }} ({{ p.numeroDossier }})</option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label">Médecin *</label>
            <select class="form-select" formControlName="medecinId">
              <option value="">-- Sélectionner un médecin --</option>
              <option *ngFor="let m of medecins" [value]="m.id">Dr. {{ m.prenom }} {{ m.nom }}</option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label">Date et heure *</label>
            <input type="datetime-local" class="form-control" formControlName="dateHeure">
          </div>
          <div class="col-md-3">
            <label class="form-label">Durée (minutes)</label>
            <input type="number" class="form-control" formControlName="dureeMinutes">
          </div>
          <div class="col-12">
            <label class="form-label">Motif</label>
            <input class="form-control" formControlName="motif">
          </div>
          <div class="col-12">
            <label class="form-label">Notes</label>
            <textarea class="form-control" rows="2" formControlName="notes"></textarea>
          </div>
        </div>

        <div class="mt-4 d-flex gap-2">
          <button type="submit" class="btn btn-primary btn-save" [disabled]="form.invalid">
            <i class="bi bi-save"></i> Enregistrer
          </button>
          <button type="button" class="btn btn-outline-secondary" (click)="router.navigate([pageRetour])">Annuler</button>
        </div>
      </form>
    </div>
  `
})
export class RdvFormComponent implements OnInit {
  patients: Patient[] = [];
  medecins: Utilisateur[] = [];
  erreur = '';
  patientIdDepuisNotification: number | null = null;
  /** Page où revenir : le calendrier quand on vient d'un clic sur un créneau. */
  pageRetour = '/rendezvous';

  form = this.fb.group({
    patientId: ['', Validators.required],
    medecinId: ['', Validators.required],
    dateHeure: ['', Validators.required],
    dureeMinutes: [30],
    motif: [''],
    notes: ['']
  });

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private route: ActivatedRoute,
    private utilisateurService: UtilisateurService,
    private rendezVousService: RendezVousService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.patientService.findAll().subscribe((p) => (this.patients = p));
    this.utilisateurService.findMedecins().subscribe((m) => (this.medecins = m));
    const patientId = this.route.snapshot.paramMap.get('patientId');
    if (patientId) {
      this.patientIdDepuisNotification = Number(patientId);
      this.form.patchValue({ patientId });
    }
    const query = this.route.snapshot.queryParamMap;
    if (query.get('dateHeure')) this.form.patchValue({ dateHeure: query.get('dateHeure')! });
    if (query.get('medecinId')) this.form.patchValue({ medecinId: query.get('medecinId')! });
    if (query.get('retour') === 'calendrier') this.pageRetour = '/rendezvous/calendrier';
  }

  enregistrer(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();

    const payload = {
      patient: { id: Number(v.patientId) },
      medecin: { id: Number(v.medecinId) },
      dateHeure: v.dateHeure ? `${v.dateHeure}:00` : null,
      dureeMinutes: Number(v.dureeMinutes || 30),
      motif: v.motif,
      notes: v.notes
    };

    this.rendezVousService.create(payload).subscribe({
      next: () => this.router.navigate([this.pageRetour]),
      error: (err) => (this.erreur = err.error?.message || 'Erreur lors de la création du rendez-vous')
    });
  }
}
