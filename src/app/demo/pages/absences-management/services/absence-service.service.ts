import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Absence } from '../model/absence';
import { User } from '../../profile/model/user';
import { MonthAbsenceSummary } from '../model/dayAbsence';


@Injectable({
  providedIn: 'root'
})
export class AbsenceService {
  private apiUrl = 'http://localhost:8080/api/absences';

  constructor(private http: HttpClient) { }

  createAbsence(absence: Absence): Observable<Absence> {
    return this.http.post<Absence>(this.apiUrl, absence);
  }
  getAllAbsences(page: number, size: number): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get(`${this.apiUrl}/all`, { params });
  }
  getAbsenceById(id: number): Observable<Absence> {
    return this.http.get<Absence>(`${this.apiUrl}/${id}`);
  }
  validateAbsence(absenceId: number): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${absenceId}/validate`, null);
  }


  rejectAbsence(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/reject`, {});
  }
  updateAbsence(id: number, absence: Absence): Observable<Absence> {
    return this.http.put<Absence>(`${this.apiUrl}/${id}`, absence);
  }
  getAbsencesByConnectedUser(page: number, size: number): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get(`${this.apiUrl}/by-user`, { params });
  }
  getMonthlyAbsenceSummary(userId: number): Observable<MonthAbsenceSummary[]> {
    return this.http.get<MonthAbsenceSummary[]>(`${this.apiUrl}/${userId}/absences/monthly-summary`);
  }


}