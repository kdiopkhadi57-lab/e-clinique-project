export type TypeActionAudit =
  | 'CREATION'
  | 'MODIFICATION'
  | 'SUPPRESSION'
  | 'CONSULTATION_DOSSIER'
  | 'MOUVEMENT_STOCK'
  | 'PAIEMENT'
  | 'ANNULATION'
  | 'CONNEXION'
  | 'ECHEC_CONNEXION'
  | 'DECONNEXION'
  | 'AUTRE';

export interface AuditLog {
  id: number;
  utilisateurId?: number;
  utilisateurUsername: string;
  action: TypeActionAudit;
  entite: string;
  entiteId?: number;
  description?: string;
  adresseIp?: string;
  succes: boolean;
  dateAction: string;
}

/** Reflète org.springframework.data.domain.Page<T> renvoyé par l'API. */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // page courante (0-indexée)
  size: number;
}
