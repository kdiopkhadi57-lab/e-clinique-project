import { Patient } from './patient.model';
import { Utilisateur } from './user.model';
import { Medicament } from './medicament.model';

export interface PrescriptionLigne {
  id?: number;
  medicament: Medicament;
  quantite: number;
  posologie?: string;
  dureeTraitement?: string;
}

export interface Consultation {
  id?: number;
  patient: Patient;
  medecin: Utilisateur;
  dateConsultation?: string;
  type?: 'GENERALE' | 'SPECIALISEE';
  motif?: string;
  symptomes?: string;
  diagnostic?: string;
  observations?: string;
  temperature?: number;
  tensionArterielle_systolique?: number;
  tensionArterielle_diastolique?: number;
  poids?: number;
  taille?: number;
  prescriptions?: PrescriptionLigne[];
}

export interface PrescriptionLigneRequest {
  medicamentId: number;
  quantite: number;
  posologie?: string;
  dureeTraitement?: string;
}

export interface ConsultationRequest {
  patientId: number;
  medecinId: number;
  rendezVousId?: number;
  type?: 'GENERALE' | 'SPECIALISEE';
  motif?: string;
  symptomes?: string;
  diagnostic?: string;
  observations?: string;
  temperature?: number;
  tensionSystolique?: number;
  tensionDiastolique?: number;
  poids?: number;
  taille?: number;
  prescriptions?: PrescriptionLigneRequest[];
}
