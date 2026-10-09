export interface Medicament {
  id?: number;
  code: string;
  nom: string;
  categorie?: string;
  forme?: string;
  unite?: string;
  description?: string;
  prixUnitaire: number;
  quantiteStock: number;
  seuilAlerte: number;
  dateExpiration?: string;
  fournisseur?: string;
  enAlerte?: boolean;
}

export type TypeMouvementStock = 'ENTREE' | 'SORTIE' | 'AJUSTEMENT';

export interface MouvementStock {
  id?: number;
  medicament: Medicament;
  type: TypeMouvementStock;
  quantite: number;
  motif?: string;
  dateMouvement?: string;
  stockApresMouvement?: number;
}

export interface MouvementStockRequest {
  medicamentId: number;
  type: TypeMouvementStock;
  quantite: number;
  motif?: string;
}
