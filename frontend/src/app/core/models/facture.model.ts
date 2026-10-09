import { Patient } from './patient.model';
import { Organisme } from './organisme.model';

export type StatutFacture = 'EN_ATTENTE' | 'PAYEE' | 'ANNULEE';
export type ModePaiement = 'ESPECES' | 'CARTE_BANCAIRE' | 'MOBILE_MONEY' | 'ASSURANCE' | 'VIREMENT';

export interface LigneFacture {
  id?: number;
  designation: string;
  quantite: number;
  prixUnitaire: number;
  montant?: number;
}

export interface Facture {
  id?: number;
  numeroFacture?: string;
  patient: Patient;
  dateFacture?: string;
  dateEcheance?: string;
  datePaiement?: string;
  statut?: StatutFacture;
  modePaiement?: ModePaiement;
  montantTotal?: number;
  observations?: string;
  remise?: number;
  dateAdmission?: string;
  dateSortie?: string;
  prixJournalierHospitalisation?: number;
  joursHospitalisation?: number;
  organisme?: Organisme | null;
  matriculeAssure?: string;
  tauxPriseEnCharge?: number;
  partOrganisme?: number;
  partPatient?: number;
  factureOrganismeId?: number | null;
  dateEnvoi?: string | null;
  envoyeA?: string | null;
  lignes: LigneFacture[];
}

export interface LigneFactureRequest {
  designation: string;
  quantite: number;
  prixUnitaire: number;
}

export interface FactureRequest {
  patientId: number;
  consultationId?: number;
  observations?: string;
  remise?: number;
  modePaiement?: ModePaiement;
  lignes: LigneFactureRequest[];
  dateAdmission?: string;
  dateSortie?: string;
  prixJournalierHospitalisation?: number;
  tiersPayant?: boolean;
  partOrganisme?: number | null;
}
