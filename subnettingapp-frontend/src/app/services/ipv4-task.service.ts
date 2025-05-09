import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResultInfo } from '../models/ResultInfo.model';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class Ipv4TaskService {
  private readonly baseUrl = `${environment.apiUrl}/api/ipv4-task`;

  constructor(private http: HttpClient) {}

  getNetworkInfo(ip: string, mask: number): Observable<ResultInfo> {
    return this.http.post<ResultInfo>(`${this.baseUrl}/si`, {
      networkAddress: ip,
      networkMask: mask,
    });
  }

  partitionSubnet(
    ip: string,
    mask: number,
    hostsCounts: number[]
  ): Observable<ResultInfo> {
    return this.http.post<ResultInfo>(`${this.baseUrl}/sp`, {
      networkAddress: ip,
      networkMask: mask,
      hostsCounts,
    });
  }

  regularPartition(
    ip: string,
    mask: number,
    count: number
  ): Observable<ResultInfo> {
    return this.http.post<ResultInfo>(`${this.baseUrl}/rp`, {
      networkAddress: ip,
      networkMask: mask,
      count,
    });
  }
}
