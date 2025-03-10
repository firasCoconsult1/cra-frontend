import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Role } from '../model/role';

@Injectable({
  providedIn: 'root'
})
export class RoleServiceService {

  private apiUrl = "http://localhost:8080/api/role";

  constructor(private httpClient:HttpClient) { }

  getRoles(){
    return this.httpClient.get<Role[]>(`${this.apiUrl}/all`);
  }
}
