import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../model/user';
@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private apiUrl = 'http://localhost:8080/api/profile';

  constructor(private http: HttpClient) { }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  updateUser(id: number, updatedUser: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/id?id=${id}`, updatedUser);
  }
  getUserByUsername(username: string): Observable<User> {
    
    return this.http.get<User>(`${this.apiUrl}/username?username=${username}`);
  }

  
}


