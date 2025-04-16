import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Page } from '../../role-management/model/page';
import { User } from '../../profile/model/user';

@Injectable({
  providedIn: 'root'
})
export class ResourceManagementService {
  private baseUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) { }


  getAllUsers(page: number, size: number, sortBy: string, direction: string): Observable<Page<User>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('direction', direction);

    return this.http.get<Page<User>>(`${this.baseUrl}/all`, { params });
  }

  getUserById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  activateUserAccount(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/activate/${id}`, {});
  }

  deactivateUserAccount(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/deactivate/${id}`, {});
  }

  assignRoleToUser(id: number, roleId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/assign-role/${id}?role=${roleId}`, {});
  }
  searchUsers(searchTerm: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/search?term=${searchTerm}`);
  }
 
  inviteUsers(emails: string[]): Observable<any> {
    let params = new HttpParams();
  
    emails.forEach(email => {
      params = params.append('emails', email);
    });
  
    return this.http.post(`${this.baseUrl}/invite`, null, { params, responseType: 'text' });
  }
  
}  

