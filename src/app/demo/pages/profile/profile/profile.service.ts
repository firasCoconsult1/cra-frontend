import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
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

  /*path variable*/
  updateUser(id: number, user: User): Observable<User> {
    console.log('Sending user update:', JSON.stringify(user));

    return this.http.put<User>(`${this.apiUrl}/${id}`, user, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      
    });
  }
  getUserByUsername(username: string): Observable<User> {
    
    return this.http.get<User>(`${this.apiUrl}/username?username=${username}`);
  }
  

  uploadImage(userId: number, file: File): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ imageUrl: string }>(`${this.apiUrl}/upload-image/${userId}`, formData)
      .pipe(
        tap(response => console.log('Image upload response:', response))
      );
}


  deleteUserImage(userId: number, fileName: string): Observable<any> {
    const url = `${this.apiUrl}/delete-image/${userId}/${fileName}`;
    return this.http.delete(url);
  }
}


  

  



