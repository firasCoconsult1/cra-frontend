import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Permission, Role, RoleDto } from '../model/role';
import { Observable } from 'rxjs';
import { Page } from '../model/page';

@Injectable({
  providedIn: 'root'
})
export class RoleServiceService {

  private apiUrl = "http://localhost:8080/api/role";
  private permissionUrl = "http://localhost:8080/api/permission";

  constructor(private httpClient:HttpClient) { }

  getAllRoles(page: number, size: number, sortBy: string, direction: string): Observable<Page<Role>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('direction', direction);

    return this.httpClient.get<Page<Role>>(`${this.apiUrl}/all`, { params });
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
  
  deleteAllPermissionsByRole(roleId: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.permissionUrl}/delete-all/${roleId}`);
  }
}

