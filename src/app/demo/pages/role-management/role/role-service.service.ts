import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Permission, Role, RoleDto } from '../model/role';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleServiceService {

  private apiUrl = "http://localhost:8080/api/role";
  private permissionUrl = "http://localhost:8080/api/permission";

  constructor(private httpClient:HttpClient) { }

  getRoles(){
    return this.httpClient.get<Role[]>(`${this.apiUrl}/all`);
  }
  addRole(roleDto: RoleDto): Observable<Role> {
    return this.httpClient.post<Role>(`${this.apiUrl}/create`, roleDto);
  }
  
  updateRole(roleDto: RoleDto, roleId: number): Observable<Role> {
    return this.httpClient.put<Role>(`${this.apiUrl}/update/${roleId}`, roleDto);
  }


  deleteRole(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
  getPermissions(){
    return this.httpClient.get<Permission[]>(`${this.permissionUrl}/all`);
  }
}

