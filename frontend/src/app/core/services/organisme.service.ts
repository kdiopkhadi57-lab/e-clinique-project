import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreanceOrganisme, Organisme } from '../models/organisme.model';

@Injectable({ providedIn: 'root' })
export class OrganismeService {
  private apiUrl = `${environment.apiUrl}/organismes`;
  constructor(private http: HttpClient) {}
  findAll(actifs = false): Observable<Organisme[]> { return this.http.get<Organisme[]>(`${this.apiUrl}?actifs=${actifs}`); }
  creances(): Observable<CreanceOrganisme[]> { return this.http.get<CreanceOrganisme[]>(`${this.apiUrl}/creances`); }
  create(organisme: Organisme): Observable<Organisme> { return this.http.post<Organisme>(this.apiUrl, organisme); }
  update(id: number, organisme: Organisme): Observable<Organisme> { return this.http.put<Organisme>(`${this.apiUrl}/${id}`, organisme); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}
