import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { JwtResponse, LoginRequest } from '../models/user.model';

const STORAGE_KEY = 'eclinique_auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  currentUser = signal<JwtResponse | null>(this.lireDepuisStockage());

  constructor(private http: HttpClient) {}

  login(request: LoginRequest): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${this.apiUrl}/login`, request).pipe(
      tap((res) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(res));
        this.currentUser.set(res);
      })
    );
  }

  /**
   * Prévient le backend (journal d'audit) avant d'effacer le jeton local.
   * L'échec de cet appel ne doit jamais empêcher la déconnexion côté client.
   */
  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}).pipe(catchError(() => of(null))).subscribe(() => {
      localStorage.removeItem(STORAGE_KEY);
      this.currentUser.set(null);
    });
    // Déconnexion immédiate côté client, sans attendre la réponse réseau.
    localStorage.removeItem(STORAGE_KEY);
    this.currentUser.set(null);
  }

  mettreAJourIdentite(nom: string, prenom: string): void {
    const actuel = this.currentUser();
    if (!actuel) return;
    const maj = { ...actuel, nom, prenom };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(maj));
    this.currentUser.set(maj);
  }

  getToken(): string | null {
    return this.currentUser()?.token ?? null;
  }

  clearSession(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.currentUser.set(null);
  }

  isAuthenticated(): boolean {
    return !!this.currentUser();
  }

  hasRole(...roles: string[]): boolean {
    const role = this.currentUser()?.role;
    return !!role && roles.includes(role);
  }

  private lireDepuisStockage(): JwtResponse | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
