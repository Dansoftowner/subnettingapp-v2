import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PasswordRestorationService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  requestReset(email: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/forgotten-password`, {
      email,
    });
  }

  resetPassword(
    userId: string,
    token: string,
    password: string
  ): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/api/forgotten-password/${userId}/${token}`,
      { password }
    );
  }
}
