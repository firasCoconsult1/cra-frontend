import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Facture } from '../model/facture';

@Injectable({
  providedIn: 'root',
})
export class FactureService {
  private apiUrl = 'http://localhost:8080/api/factures';

  constructor(private http: HttpClient) { }

  createFacture(facture: Facture): Observable<Facture> {
    return this.http.post<Facture>(this.apiUrl, facture);
  }


  getFactures(page: number, size: number): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get(`${this.apiUrl}/all`, { params });
  }


  getFactureById(id: number): Observable<Facture> {
    return this.http.get<Facture>(`${this.apiUrl}/${id}`);
  }

  updateFacture(id: number, facture: Facture): Observable<Facture> {
    return this.http.put<Facture>(`${this.apiUrl}/${id}`, facture);
  }

  


  downloadFacture(id: number): Observable<Blob> {
    const url = `${this.apiUrl}/${id}/download`;
    return this.http.get(url, { responseType: 'blob' });
  }
  searchFactures(searchTerm: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/search?term=${searchTerm}`);
  }
  payerFacture(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/payer`, {});
  }
  getAllFacturesForDashboard(): Observable<Facture[]> {
    return this.http.get<Facture[]>(`${this.apiUrl}/dashboard`);
  }


  uploadFile(username: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.apiUrl}/upload/${username}`, formData, {
      responseType: 'text',
      observe: 'response'
    });
  }

  searchFacturesInDrive(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/drive/search?q=${encodeURIComponent(query)}`);
  }
  deleteFacture(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }

}


