export interface ComptabiliteResume {
  totalFactures: number;
  totalConsultations: number;
  totalHospitalisations: number;
  totalEncaissements: number;
  encaissementsConsultations: number;
  encaissementsRendezVous: number;
  encaissementsAujourdhui: number;
  totalPartPatients: number;
  totalPartOrganismes: number;
  creancesOrganismesEnAttente: number;
  creancesOrganismesPayees: number;
  totalRecettes: number;
  totalPaiementsEmployes: number;
  solde: number;
}

export interface PaiementEmploye {
  id?: number;
  employeId: number;
  employeNom: string;
  montant: number;
  periode: string;
  motif?: string;
  datePaiement: string;
}

export interface Encaissement {
  id: number;
  type: 'CONSULTATION' | 'RENDEZVOUS';
  montant: number;
  patientId?: number;
  patientNom: string;
  numeroDossier?: string;
  medecinNom?: string;
  typeConsultation?: string;
  enregistreParNom?: string;
  dateEncaissement: string;
  organismeId?: number;
  organismeNom?: string;
  partOrganisme: number;
  partPatient: number;
  matriculeAssure?: string;
  factureOrganismeId?: number;
}

export type PeriodeBilan = 'MOIS' | 'TRIMESTRE' | 'SEMESTRE' | 'ANNEE';

export interface BilanPeriode {
  libelle: string;
  debut: string;
  fin: string;
  recettesPatients: number;
  recettesOrganismes: number;
  recettesFactures: number;
  totalRecettes: number;
  depenses: number;
  solde: number;
  nombreActes: number;
}
