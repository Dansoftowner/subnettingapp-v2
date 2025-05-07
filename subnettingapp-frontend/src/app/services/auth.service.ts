import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = environment.apiUrl;
  private headerName = environment.jwtHeaderName;

  public authChanged: EventEmitter<User | null> = new EventEmitter();

  constructor(private http: HttpClient) {
    const stored = localStorage.getItem('current_user');
    this.authChanged.emit(stored ? JSON.parse(stored) : null);
  }

  register(
    fullName: string,
    email: string,
    password: string
  ): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/api/registration`, {
      fullName,
      email,
      password,
    });
  }

  login(email: string, password: string): Observable<User> {
    return this.http
      .post<User>(
        `${this.baseUrl}/api/login`,
        { email, password },
        { observe: 'response' }
      )
      .pipe(
        map((resp: HttpResponse<User>) => {
          const token = resp.headers.get(this.headerName);
          const user = resp.body!;
          if (token) {
            localStorage.setItem('jwt_token', token);
            localStorage.setItem('current_user', JSON.stringify(user));
            this.authChanged.emit(user);
          }
          return user;
        })
      );
  }

  logout(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('current_user');
    this.authChanged.emit(null);
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    const json = localStorage.getItem('current_user');
    return json ? JSON.parse(json) : null;
  }
}
