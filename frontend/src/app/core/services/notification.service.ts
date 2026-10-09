import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Notification } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  findAll(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.apiUrl);
  }

  marquerLue(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/lue`, {});
  }
}