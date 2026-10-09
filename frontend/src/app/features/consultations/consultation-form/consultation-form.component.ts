import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Patient } from '../../../core/models/patient.model';
import { Medicament } from '../../../core/models/medicament.model';
import { PatientService } from '../../../core/services/patient.service';
import { MedicamentService } from '../../../core/services/medicament.service';
import { ConsultationService } from '../../../core/services/consultation.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-consultation-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h4 class="mb-1"><i class="bi bi-journal-medical"></i> Nouvelle consultation</h4>
    <p class="text-muted" *ngIf="patient">Patient : <strong>{{ patient.prenom }} {{ patient.nom }}</strong> — Dossier n° {{ patient.numeroDossier }}</p>

    <div class="alert alert-danger" *ngIf="erreur">{{ erreur }}</div>

    <div class="card p-4">
      <form [formGroup]="form" (ngSubmit)="enregistrer()">
        <h6 class="text-primary">Examen clinique</h6>
        <div class="row g-3 mb-3">
          <div class="col-md-4">
            <label class="form-label">Type de consultation</label>
            <select class="form-select" formControlName="type">
              <option value="GENERALE">Consultation générale</option>
              <option value="SPECIALISEE">Consultation spécialisée</option>
            </select>
          </div>
          <div class="col-12">
            <label class="form-label">Motif de consultation</label>
            <input class="form-control" formControlName="motif">
          </div>
          <div class="col-md-6">
            <label class="form-label">Symptômes</label>
            <textarea class="form-control" rows="2" formControlName="symptomes"></textarea>
          </div>
          <div class="col-md-6">
            <label class="form-label">Diagnostic</label>
            <textarea class="form-control" rows="2" formControlName="diagnostic"></textarea>
          </div>
          <div class="col-12">
            <label class="form-label">Observations</label>
            <textarea class="form-control" rows="2" formControlName="observations"></textarea>
          </div>
          <div class="col-md-3">
            <label class="form-label">Température (°C)</label>
            <input type="number" step="0.1" class="form-control" formControlName="temperature">
          </div>
          <div class="col-md-3">
            <label class="form-label">Tension systolique</label>
            <input type="number" class="form-control" formControlName="tensionSystolique">
          </div>
          <div class="col-md-3">
            <label class="form-label">Tension diastolique</label>
            <input type="number" class="form-control" formControlName="tensionDiastolique">
          </div>
          <div class="col-md-3">
            <label class="form-label">Poids (kg)</label>
            <input type="number" step="0.1" class="form-control" formControlName="poids">
          </div>
          <div class="col-md-3">
            <label class="form-label">Taille (cm)</label>
            <input type="number" class="form-control" formControlName="taille">
          </div>
        </div>

        <hr>

        <div class="d-flex justify-content-between align-items-center mb-2">
          <h6 class="text-primary mb-0">Prescriptions médicales</h6>
          <button type="button" class="btn btn-sm btn-outline-primary" (click)="ajouterLigne()">
            <i class="bi bi-plus-lg"></i> Ajouter un médicament
          </button>
        </div>

        <div class="table-responsive" *ngIf="prescriptions.length > 0">
          <table class="table align-middle">
            <thead>
              <tr>
                <th>Médicament</th>
                <th style="width:100px">Quantité</th>
                <th>Posologie</th>
                <th>Durée traitement</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let ligne of prescriptions.controls; let i = index" [formGroup]="asFormGroup(ligne)">
                <td>
                  <select class="form-select form-select-sm" formControlName="medicamentId">
                    <option value="">-- Choisir --</option>
                    <option *ngFor="let m of medicaments" [value]="m.id">
                      {{ m.nom }} (stock: {{ m.quantiteStock }})
                    </option>
                  </select>
                </td>
                <td><input type="number" class="form-control form-control-sm" formControlName="quantite"></td>
                <td><input class="form-control form-control-sm" formControlName="posologie" placeholder="ex: 1 comprimé x 3/j"></td>
                <td><input class="form-control form-control-sm" formControlName="dureeTraitement" placeholder="ex: 7 jours"></td>
                <td>
                  <button type="button" class="btn btn-sm btn-outline-danger" (click)="supprimerLigne(i)">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-muted small" *ngIf="prescriptions.length === 0">Aucun médicament prescrit.</p>
        <p class="text-warning small">
          <i class="bi bi-info-circle"></i> Le stock des médicaments prescrits sera automatiquement décrémenté à l'enregistrement.
        </p>

        <div class="mt-4 d-flex gap-2">
          <button type="submit" class="btn btn-primary btn-save" [disabled]="form.invalid">
            <i class="bi bi-save"></i> Enregistrer la consultation
          </button>
          <button type="button" class="btn btn-outline-secondary" (click)="router.navigate(['/patients', patientId])">Annuler</button>
        </div>
      </form>
    </div>
  `
})
export class ConsultationFormComponent implements OnInit {
  patientId!: number;
  patient: Patient | null = null;
  medicaments: Medicament[] = [];
  erreur = '';

  form = this.fb.group({
    type: ['GENERALE'],
    motif: [''],
    symptomes: [''],
    diagnostic: [''],
    observations: [''],
    temperature: [null],
    tensionSystolique: [null],
    tensionDiastolique: [null],
    poids: [null],
    taille: [null],
    prescriptions: this.fb.array([])
  });

  get prescriptions(): FormArray {
    return this.form.get('prescriptions') as FormArray;
  }

  asFormGroup(c: any) {
    return c;
  }

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public router: Router,
    private patientService: PatientService,
    private medicamentService: MedicamentService,
    private consultationService: ConsultationService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.patientId = Number(this.route.snapshot.paramMap.get('patientId'));
    this.patientService.findById(this.patientId).subscribe((p) => (this.patient = p));
    this.medicamentService.findAll().subscribe((m) => (this.medicaments = m));
  }

  ajouterLigne(): void {
    this.prescriptions.push(
      this.fb.group({
        medicamentId: ['', Validators.required],
        quantite: [1, [Validators.required, Validators.min(1)]],
        posologie: [''],
        dureeTraitement: ['']
      })
    );
  }

  supprimerLigne(index: number): void {
    this.prescriptions.removeAt(index);
  }

  enregistrer(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const medecinId = this.auth.currentUser()?.id;
    if (!medecinId) return;

    const payload = {
      patientId: this.patientId,
      medecinId: medecinId,
      type: (v.type || 'GENERALE') as 'GENERALE' | 'SPECIALISEE',
      motif: v.motif || undefined,
      symptomes: v.symptomes || undefined,
      diagnostic: v.diagnostic || undefined,
      observations: v.observations || undefined,
      temperature: v.temperature || undefined,
      tensionSystolique: v.tensionSystolique || undefined,
      tensionDiastolique: v.tensionDiastolique || undefined,
      poids: v.poids || undefined,
      taille: v.taille || undefined,
      prescriptions: (v.prescriptions as any[]).map((p) => ({
        medicamentId: Number(p.medicamentId),
        quantite: Number(p.quantite),
        posologie: p.posologie || undefined,
        dureeTraitement: p.dureeTraitement || undefined
      }))
    };

    this.consultationService.creer(payload).subscribe({
      next: () => this.router.navigate(['/consultations']),
      error: (err) => (this.erreur = err.error?.message || "Erreur lors de l'enregistrement de la consultation")
    });
  }
}
