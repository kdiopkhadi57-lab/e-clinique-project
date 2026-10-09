import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Utilisateur } from '../models/user.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ProfilService {
  private apiUrl = `${environment.apiUrl}/profil`;
  constructor(private http: HttpClient, private auth: AuthService) {}

  moi(): Observable<Utilisateur> { return this.http.get<Utilisateur>(this.apiUrl); }

  /** Met aussi à jour le nom affiché dans l'en-tête. */
  modifier(profil: { nom: string; prenom: string; email?: string; telephone?: string }): Observable<Utilisateur> {
    return this.http.put<Utilisateur>(this.apiUrl, profil).pipe(tap((u) => this.auth.mettreAJourIdentite(u.nom, u.prenom)));
  }

  changerMotDePasse(motDePasseActuel: string, nouveauMotDePasse: string): Observable<unknown> {
    return this.http.put(`${this.apiUrl}/mot-de-passe`, { motDePasseActuel, nouveauMotDePasse });
  }
}
