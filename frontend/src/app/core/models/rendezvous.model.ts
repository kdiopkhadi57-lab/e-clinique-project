import { Patient } from './patient.model';
import { Utilisateur } from './user.model';

export type StatutRendezVous = 'PLANIFIE' | 'CONFIRME' | 'EN_COURS' | 'TERMINE' | 'ANNULE';

export interface RendezVous {
  id?: number;
  patient: Patient;
  medecin: Utilisateur;
  dateHeure: string;
  dureeMinutes?: number;
  motif?: string;
  statut?: StatutRendezVous;
  notes?: string;
  dateCreation?: string;
}
