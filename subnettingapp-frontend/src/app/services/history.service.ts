import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HistoryItem } from '../models/history-item.model';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private readonly baseUrl = `${environment.apiUrl}/api/history-items`;

  constructor(private http: HttpClient) {}

  getHistoryItems(
    offset: number,
    limit: number
  ): Observable<{ offset: number; limit: number; items: HistoryItem[] }> {
    return this.http.get<{
      offset: number;
      limit: number;
      items: HistoryItem[];
    }>(`${this.baseUrl}?offset=${offset}&limit=${limit}`);
  }

  createHistoryItem(): Observable<HistoryItem> {
    return this.http.post<HistoryItem>(this.baseUrl, {});
  }

  getHistoryItemById(id: string): Observable<HistoryItem> {
    return this.http.get<HistoryItem>(`${this.baseUrl}/${id}`);
  }

  patchHistoryItem(
    id: string,
    changes: Partial<HistoryItem>
  ): Observable<HistoryItem> {
    return this.http.patch<HistoryItem>(`${this.baseUrl}/${id}`, changes);
  }

  deleteHistoryItem(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
