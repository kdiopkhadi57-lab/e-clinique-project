export interface Notification {
  id: number;
  message: string;
  type: 'CONSULTATION' | 'FACTURE' | 'PATIENT_CONSULTATION' | 'PATIENT_RENDEZVOUS';
  consultationId?: number;
  factureId?: number;
  rendezVousId?: number;
  patientId: number;
  patientNom?: string;
  patientPrenom?: string;
  numeroDossier?: string;
  medecinId?: number;
  medecinNom?: string;
  medecinPrenom?: string;
  typeConsultation?: 'GENERALE' | 'SPECIALISEE';
  montantConsultation?: number;
  lue: boolean;
  dateCreation: string;
}