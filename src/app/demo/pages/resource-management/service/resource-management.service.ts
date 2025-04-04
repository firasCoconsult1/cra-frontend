import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResourceManagementService {
  private baseUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) { }

  getAllUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/all`);
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
getByUername(username: string): Observable<any> {
  return this.http.get(`${this.baseUrl}/username/${username}`);
}
}
