import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PatientService } from '../../../core/services/patient.service';
import { FactureService } from '../../../core/services/facture.service';
import { Patient } from '../../../core/models/patient.model';

@Component({
  selector: 'app-facture-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h4 class="mb-3"><i class="bi bi-file-earmark-plus"></i> Nouvelle facture</h4>

    <div class="alert alert-danger" *ngIf="erreur">{{ erreur }}</div>

    <div class="card p-4">
      <form [formGroup]="form" (ngSubmit)="enregistrer()">
        <div class="row g-3 mb-3">
          <div class="col-md-6">
            <label class="form-label">Patient *</label>
            <select class="form-select" formControlName="patientId" (change)="partManuelle = false">
              <option value="">-- Sélectionner un patient --</option>
              <option *ngFor="let p of patients" [value]="p.id">{{ p.prenom }} {{ p.nom }} ({{ p.numeroDossier }}){{ p.organisme ? ' — ' + p.organisme.nom : '' }}</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Remise (FCFA)</label>
            <input type="number" min="0" class="form-control" formControlName="remise">
          </div>
          <div class="col-md-3">
            <label class="form-label">Mode de paiement</label>
            <select class="form-select" formControlName="modePaiement">
              <option value="">-- À définir --</option>
              <option value="ESPECES">Espèces</option>
              <option value="CARTE_BANCAIRE">Carte bancaire</option>
              <option value="MOBILE_MONEY">Mobile Money</option>
              <option value="ASSURANCE">Assurance</option>
              <option value="VIREMENT">Virement</option>
            </select>
          </div>
        </div>

        <div class="hospitalisation-panel mb-4 p-3 border rounded bg-light">
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" formControlName="hospitalisation" id="hospitalisation" (change)="actualiserValidationHospitalisation()">
            <label class="form-check-label fw-semibold" for="hospitalisation">
              <i class="bi bi-hospital me-1"></i> Ajouter une hospitalisation
            </label>
          </div>
          <div class="row g-3 mt-1" *ngIf="form.get('hospitalisation')?.value">
            <div class="col-md-4">
              <label class="form-label">Date d'admission *</label>
              <input type="date" class="form-control" formControlName="dateAdmission">
            </div>
            <div class="col-md-4">
              <label class="form-label">Date de sortie</label>
              <input type="date" class="form-control" formControlName="dateSortie">
              <small class="text-muted">Vide = jusqu'à aujourd'hui</small>
            </div>
            <div class="col-md-4">
              <label class="form-label">Prix journalier (FCFA) *</label>
              <input type="number" min="0" class="form-control" formControlName="prixJournalierHospitalisation">
            </div>
            <div class="col-12" *ngIf="joursHospitalisation() > 0">
              <div class="hospitalisation-total d-flex justify-content-between align-items-center p-3 rounded bg-success-subtle text-success-emphasis">
                <span><i class="bi bi-calendar3"></i> {{ joursHospitalisation() }} jour(s) d'hospitalisation</span>
                <strong>{{ montantHospitalisation() | number:'1.0-0' }} FCFA</strong>
              </div>
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-between align-items-center mb-2">
          <h6 class="text-primary mb-0">Produits</h6>
          <button type="button" class="btn btn-sm btn-outline-primary" (click)="ajouterLigne()">
            <i class="bi bi-plus-lg"></i> Ajouter une ligne
          </button>
        </div>

        <div class="table-responsive" *ngIf="lignes.length > 0">
          <table class="table table-sm align-middle">
            <thead>
              <tr>
                <th style="width: 45%">Désignation</th>
                <th style="width: 15%">Qté</th>
                <th style="width: 20%">Prix unitaire</th>
                <th style="width: 15%">Montant</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let ligne of lignes.controls; let i = index" [formGroup]="asFormGroup(ligne)">
                <td><input class="form-control form-control-sm" formControlName="designation" placeholder="ex: Consultation générale"></td>
                <td><input type="number" min="1" class="form-control form-control-sm" formControlName="quantite"></td>
                <td><input type="number" min="0" class="form-control form-control-sm" formControlName="prixUnitaire"></td>
                <td class="fw-bold">{{ montantLigne(i) | number:'1.0-0' }}</td>
                <td>
                  <button type="button" class="btn btn-sm btn-outline-danger" (click)="supprimerLigne(i)">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-muted" *ngIf="lignes.length === 0">Aucune ligne ajoutée.</p>

        <div class="mt-3">
          <label class="form-label">Observation</label>
          <textarea class="form-control" rows="3" formControlName="observations" placeholder="Ajoutez une observation ou une note pour cette facture..."></textarea>
        </div>

        <div class="mt-3 p-3 border rounded" *ngIf="patientChoisi?.organisme as o">
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" formControlName="tiersPayant" id="tiersPayant" (change)="partManuelle = false">
            <label class="form-check-label fw-semibold" for="tiersPayant">
              <i class="bi bi-shield-check me-1"></i> Tiers-payant {{ o.nom }}
            </label>
          </div>
          <div class="alert alert-warning py-2 mt-2 mb-0" *ngIf="tauxPatient() === 0">
            Couverture expirée ou organisme inactif : la facture sera entièrement à la charge du patient.
          </div>
          <div class="row g-3 mt-1" *ngIf="form.get('tiersPayant')?.value && tauxPatient() > 0">
            <div class="col-md-4">
              <label class="form-label">Part {{ o.nom }} (FCFA)</label>
              <input type="number" min="0" class="form-control" [value]="partOrganisme()"
                     (input)="saisirPartOrganisme($any($event.target).value)">
              <small class="text-muted">Taux {{ tauxPatient() }} %<span *ngIf="patientChoisi?.matriculeAssure"> · matricule {{ patientChoisi?.matriculeAssure }}</span>
                <a href="" class="ms-1" *ngIf="partManuelle" (click)="$event.preventDefault(); partManuelle = false">recalculer</a></small>
            </div>
            <div class="col-md-4">
              <label class="form-label">Part patient (FCFA)</label>
              <input class="form-control" [value]="(totalGeneral() - partOrganisme()) | number:'1.0-0'" disabled>
            </div>
          </div>
          <div class="text-danger small mt-1" *ngIf="partOrganisme() > totalGeneral()">La part prise en charge dépasse le total.</div>
        </div>

        <div class="text-end mt-3">
          <h5>Total : {{ totalGeneral() | number:'1.0-0' }} FCFA</h5>
          <div *ngIf="partOrganisme() > 0" class="text-muted">
            dont {{ patientChoisi?.organisme?.nom }} : {{ partOrganisme() | number:'1.0-0' }} FCFA —
            <strong class="text-body">à payer par le patient : {{ totalGeneral() - partOrganisme() | number:'1.0-0' }} FCFA</strong>
          </div>
        </div>

        <div class="mt-4 d-flex gap-2">
          <button type="submit" class="btn btn-primary btn-save" [disabled]="form.invalid || lignes.length === 0 || partOrganisme() > totalGeneral()">
            <i class="bi bi-save"></i> Créer la facture
          </button>
          <button type="button" class="btn btn-outline-secondary" (click)="router.navigate(['/factures'])">Annuler</button>
        </div>
      </form>
    </div>
  `
})
export class FactureFormComponent implements OnInit {
  patients: Patient[] = [];
  erreur = '';
  /** Part organisme saisie à la main ; sinon elle suit le taux du patient. */
  partManuelle = false;
  private partSaisie = 0;

  form = this.fb.group({
    patientId: ['', Validators.required],
    observations: [''],
    remise: [0, [Validators.min(0)]],
    modePaiement: [''],
    hospitalisation: [false],
    tiersPayant: [true],
    dateAdmission: [''],
    dateSortie: [''],
    prixJournalierHospitalisation: [0, [Validators.min(0)]],
    lignes: this.fb.array([])
  });

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private factureService: FactureService,
    public router: Router
  ) {}

  get lignes(): FormArray {
    return this.form.get('lignes') as FormArray;
  }

  asFormGroup(ctrl: any) {
    return ctrl;
  }

  ngOnInit(): void {
    this.patientService.findAll().subscribe((p) => (this.patients = p));
    this.ajouterLigne();
  }

  ajouterLigne(): void {
    this.lignes.push(
      this.fb.group({
        designation: ['', Validators.required],
        quantite: [1, [Validators.required, Validators.min(1)]],
        prixUnitaire: [0, [Validators.required, Validators.min(0)]]
      })
    );
  }

  supprimerLigne(index: number): void {
    this.lignes.removeAt(index);
  }

  actualiserValidationHospitalisation(): void {
    const active = this.form.get('hospitalisation')?.value;
    const dateAdmission = this.form.get('dateAdmission');
    const prixJournalier = this.form.get('prixJournalierHospitalisation');
    if (active) {
      dateAdmission?.setValidators(Validators.required);
      prixJournalier?.setValidators([Validators.required, Validators.min(0)]);
    } else {
      dateAdmission?.clearValidators();
      prixJournalier?.setValidators(Validators.min(0));
      dateAdmission?.setValue('');
      this.form.get('dateSortie')?.setValue('');
      prixJournalier?.setValue(0);
    }
    dateAdmission?.updateValueAndValidity();
    prixJournalier?.updateValueAndValidity();
  }

  joursHospitalisation(): number {
    const admission = this.form.get('dateAdmission')?.value;
    if (!admission) return 0;
    const sortie = this.form.get('dateSortie')?.value || this.dateLocaleAujourdHui();
    const debut = this.dateEnUtc(admission);
    const fin = this.dateEnUtc(sortie);
    const jours = Math.floor((fin - debut) / 86400000) + 1;
    return jours > 0 ? jours : 0;
  }

  montantHospitalisation(): number {
    return this.joursHospitalisation() * Number(this.form.get('prixJournalierHospitalisation')?.value || 0);
  }

  montantLigne(index: number): number {
    const v = this.lignes.at(index).value;
    return (v.quantite || 0) * (v.prixUnitaire || 0);
  }

  totalGeneral(): number {
    let total = 0;
    for (let i = 0; i < this.lignes.length; i++) total += this.montantLigne(i);
    if (this.form.get('hospitalisation')?.value) total += this.montantHospitalisation();
    const remise = Number(this.form.get('remise')?.value || 0);
    return Math.max(total - remise, 0);
  }

  get patientChoisi(): Patient | undefined {
    const id = Number(this.form.get('patientId')?.value);
    return id ? this.patients.find((p) => p.id === id) : undefined;
  }

  /** Même règle que le serveur : taux du patient ou de l'organisme, 0 si couverture expirée / organisme inactif. */
  tauxPatient(): number {
    const p = this.patientChoisi;
    if (!p?.organisme || !p.organisme.actif) return 0;
    if (p.dateFinCouverture && p.dateFinCouverture < this.dateLocaleAujourdHui()) return 0;
    return p.tauxPriseEnCharge ?? p.organisme.tauxPriseEnCharge ?? 0;
  }

  partOrganisme(): number {
    if (!this.form.get('tiersPayant')?.value || this.tauxPatient() === 0) return 0;
    return this.partManuelle ? this.partSaisie : Math.round(this.totalGeneral() * this.tauxPatient() / 100);
  }

  saisirPartOrganisme(valeur: string): void {
    this.partManuelle = true;
    this.partSaisie = Math.max(Number(valeur) || 0, 0);
  }

  enregistrer(): void {
    if (this.form.invalid || this.lignes.length === 0 || this.partOrganisme() > this.totalGeneral()) return;
    const v = this.form.getRawValue();
    const remise = Number(v.remise || 0);
    const lignes = v.lignes.map((ligne: any) => ({
      designation: ligne.designation,
      quantite: Number(ligne.quantite),
      prixUnitaire: Number(ligne.prixUnitaire)
    }));

    const payload: any = {
      patientId: Number(v.patientId),
      observations: v.observations || '',
      remise,
      modePaiement: v.modePaiement || null,
      lignes,
      tiersPayant: !!v.tiersPayant,
      partOrganisme: this.partManuelle && v.tiersPayant ? this.partSaisie : null
    };
    if (v.hospitalisation) {
      payload.dateAdmission = v.dateAdmission;
      payload.dateSortie = v.dateSortie || null;
      payload.prixJournalierHospitalisation = Number(v.prixJournalierHospitalisation || 0);
    }

    this.factureService.creer(payload as any).subscribe({
      next: (f) => this.router.navigate(['/factures', f.id]),
      error: (err) => (this.erreur = err.error?.message || 'Erreur lors de la création de la facture')
    });
  }

  private dateLocaleAujourdHui(): string {
    const maintenant = new Date();
    return `${maintenant.getFullYear()}-${String(maintenant.getMonth() + 1).padStart(2, '0')}-${String(maintenant.getDate()).padStart(2, '0')}`;
  }

  private dateEnUtc(date: string): number {
    const [annee, mois, jour] = date.split('-').map(Number);
    return Date.UTC(annee, mois - 1, jour);
  }
}
