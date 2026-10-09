import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Patient } from '../../../core/models/patient.model';
import { PatientService } from '../../../core/services/patient.service';

@Component({
  selector: 'app-consultation-patient-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h4 class="mb-1"><i class="bi bi-journal-medical"></i> Nouvelle consultation</h4>
        <p class="text-muted mb-0">Sélectionnez le patient avant de commencer la consultation.</p>
      </div>
      <button type="button" class="btn btn-outline-secondary" (click)="router.navigate(['/consultations'])">
        Annuler
      </button>
    </div>

    <div class="card p-4" style="max-width: 720px;">
      <label class="form-label" for="patient">Patient</label>
      <select id="patient" class="form-select" [(ngModel)]="patientId">
        <option [ngValue]="null">-- Sélectionner un patient --</option>
        <option *ngFor="let patient of patients" [ngValue]="patient.id">
          {{ patient.prenom }} {{ patient.nom }} — {{ patient.numeroDossier }}
        </option>
      </select>
      <div class="mt-3">
        <button type="button" class="btn btn-primary" [disabled]="!patientId" (click)="continuer()">
          <i class="bi bi-arrow-right"></i> Continuer vers la consultation
        </button>
      </div>
    </div>
  `
})
export class ConsultationPatientSelectComponent implements OnInit {
  patients: Patient[] = [];
  patientId: number | null = null;

  constructor(private patientService: PatientService, public router: Router) {}

  ngOnInit(): void {
    this.patientService.findAll().subscribe((patients) => (this.patients = patients));
  }

  continuer(): void {
    if (this.patientId) {
      this.router.navigate(['/consultations/nouvelle', this.patientId]);
    }
  }
}