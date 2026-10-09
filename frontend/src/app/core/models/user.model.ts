export type Role = 'ADMIN' | 'MEDECIN' | 'INFIRMIER' | 'PHARMACIEN' | 'RECEPTIONNISTE' | 'EMPLOYE';

export interface Utilisateur {
  id: number;
  username: string;
  email: string;
  nom: string;
  prenom: string;
  telephone?: string;
  profession?: string;
  anneesExperience?: number;
  tauxHoraire?: number;
  role: Role;
  actif: boolean;
  dateCreation?: string;
}

export interface JwtResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  nom: string;
  prenom: string;
  role: Role;
}

export interface LoginRequest {
  username: string;
  password: string;
}
