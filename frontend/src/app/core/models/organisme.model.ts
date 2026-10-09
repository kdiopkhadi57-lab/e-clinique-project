import { ModePaiement, StatutFacture } from './facture.model';

export type TypeOrganisme = 'ASSURANCE' | 'IPM';

export interface Organisme {
  id?: number;
  nom: string;
  type: TypeOrganisme;
  tauxPriseEnCharge: number;
  adresse?: string;
  telephone?: string;
  email?: string;
  ninea?: string;
  contact?: string;
  actif: boolean;
}

export interface CreanceOrganisme {
  organismeId: number;
  nom: string;
  type: TypeOrganisme;
  nombrePrisesEnCharge: number;
  totalPrisEnCharge: number;
  nonFacture: number;
  factureEnAttente: number;
  paye: number;
}

export interface FactureOrganisme {
  id: number;
  numero: string;
  organisme: Organisme;
  periodeDebut: string;
  periodeFin: string;
  dateEmission: string;
  montantTotal: number;
  statut: StatutFacture;
  modePaiement?: ModePaiement;
  datePaiement?: string;
  observations?: string;
  creeParNom?: string;
  nombreLignes: number;
  lignes: PriseEnCharge[];
  dateEnvoi?: string | null;
  envoyeA?: string | null;
}

/** Ligne facturable à un organisme : encaissement d'accueil ou facture patient en tiers-payant. */
export interface PriseEnCharge {
  source: 'ENCAISSEMENT' | 'FACTURE';
  id: number;
  reference?: string;
  date: string;
  patientId?: number;
  patientNom: string;
  numeroDossier?: string;
  matriculeAssure?: string;
  acte: string;
  medecinNom?: string;
  montant: number;
  partPatient: number;
  partOrganisme: number;
}

export interface FactureOrganismeRequest {
  organismeId: number;
  periodeDebut: string;
  periodeFin: string;
  observations?: string;
}
