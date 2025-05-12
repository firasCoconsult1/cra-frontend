import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cra } from '../model/Cra';

@Injectable({
  providedIn: 'root'
})
export class CrasService {
  private apiUrl = 'http://localhost:8080/api/cra';

  constructor(private http: HttpClient) { }

  saveCra(cra: Cra): Observable<Cra> {
    return this.http.post<Cra>(this.apiUrl, cra);
  }


  getCraByConnectedUser(page: number, size: number): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get(`${this.apiUrl}/by-user`, { params });
  }
  getAllCra(page: number, size: number): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get(`${this.apiUrl}/all`, { params });
  }

  getCraById(id: number): Observable<Cra> {
    return this.http.get<Cra>(`${this.apiUrl}/${id}`);
  }

  updateCra(id: number, cra: Cra): Observable<Cra> {
    return this.http.put<Cra>(`${this.apiUrl}/${id}`, cra);
  }
  sendCra(id: number): Observable<Cra> {
    return this.http.put<Cra>(`${this.apiUrl}/${id}/send`, {});
  }


  validateCra(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/validate`, {});
  }

  rejectCra(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/reject`, {});
  }
}





