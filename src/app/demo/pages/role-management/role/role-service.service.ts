import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Permission, Role, RoleDto } from '../model/role';
import { BehaviorSubject, Observable } from 'rxjs';
import { Page } from '../model/page';

@Injectable({
  providedIn: 'root'
})
export class RoleServiceService {

  private apiUrl = "http://localhost:8080/api/role";
  private permissionUrl = "http://localhost:8080/api/permission";

  private permissions: string[] = [];
  private permissionsLoadedSubject = new BehaviorSubject<boolean>(false);
  public permissionsLoaded$ = this.permissionsLoadedSubject.asObservable();

  constructor(private httpClient: HttpClient) { }

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
  getPermissions() {
    return this.httpClient.get<Permission[]>(`${this.permissionUrl}/all`);
  }

  deleteAllPermissionsByRole(roleId: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.permissionUrl}/delete-all/${roleId}`);
  }

  getCurrentUserPermissions(): Observable<string[]> {
    const baseUrl = 'http://localhost:8080/api/auth';
    return this.httpClient.get<string[]>(`${baseUrl}/current/permissions`);
  }

  loadCurrentUserPermissions(): void {
    this.getCurrentUserPermissions().subscribe({
      next: (userPermissions) => {
        console.log('Loading user-specific permissions:', userPermissions);
        this.permissions = userPermissions; 
        this.permissionsLoadedSubject.next(true);
      },
      error: (error) => {
        console.error('Error loading user permissions:', error);
        this.permissions = [];
        this.permissionsLoadedSubject.next(false);
      }
    });
  }

  hasPermission(permission: string): boolean {
    console.log('=== DEBUG PERMISSION ===');
    console.log('Requested permission:', permission);
    console.log('User permissions array:', this.permissions);

    if (!this.permissions || !Array.isArray(this.permissions)) {
      console.log('No valid permissions found');
      return false;
    }

    const hasPermission = this.permissions.includes(permission);
    console.log('User has permission:', hasPermission);
    console.log('========================');

    return hasPermission;
  }

  getUserPermissions(): string[] {
    return this.permissions || [];
  }

}







