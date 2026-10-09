import { Organisme } from './organisme.model';

export type Sexe = 'HOMME' | 'FEMME';

export interface Patient {
  id?: number;
  nom: string;
  prenom: string;
  dateNaissance?: string;
  sexe?: Sexe;
  adresse?: string;
  telephone?: string;
  email?: string;
  numeroDossier?: string;
  groupeSanguin?: string;
  allergies?: string;
  antecedentsMedicaux?: string;
  personneAContacter?: string;
  telephonePersonneAContacter?: string;
  organisme?: Organisme | null;
  matriculeAssure?: string;
  tauxPriseEnCharge?: number | null;
  dateFinCouverture?: string | null;
  dateCreation?: string;
}
