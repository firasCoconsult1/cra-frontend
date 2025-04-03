import { Component, OnInit } from '@angular/core';
import { Card } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { User } from '../profile/model/user';
import { ResourceManagementService } from './service/resource-management.service';
import { CommonModule } from '@angular/common';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FormsModule } from '@angular/forms';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputIconModule } from 'primeng/inputicon';
import { InputSwitchModule } from 'primeng/inputswitch';
import { Dialog } from 'primeng/dialog';
import { Role } from '../role-management/model/role';
import { DropdownModule } from 'primeng/dropdown';
import { RoleServiceService } from '../role-management/role/role-service.service';

import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';




@Component({
  selector: 'app-resource-management',
  imports: [ PaginatorModule,DropdownModule, Dialog, Card, InputTextModule, ButtonModule, ToolbarModule, ToastModule, CommonModule, RadioButtonModule, FormsModule, InputGroupModule, InputIconModule, InputSwitchModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './resource-management.component.html',
  styleUrl: './resource-management.component.scss'
})
export class ResourceManagementComponent implements OnInit {

  displayUserDialog: boolean = false;
  displayRoleDialog: boolean = false;
  selectedUser: User;
  selectedRole: string;
  roles: Role[] = [];
  searchTerm: string = '';
  filteredUsers: User[] = [];

  user: User;
  users: User[] = [];
  currentPage: number = 0;
  itemsPerPage: number = 6; // Nombre d'éléments par page


  constructor(private roleService: RoleServiceService, private resourceService: ResourceManagementService, private messageService: MessageService, private confirmationService: ConfirmationService) { }
  ngOnInit(): void {
    this.getAllUsers();
    this.getAllRoles();
  }
  getAllRoles(): void {
    this.roleService.getRoles().subscribe(
      (data: Role[]) => {
        this.roles = data; // Stocker les rôles récupérés
      },
      (error) => {
        console.error('Error fetching roles', error);
      }
    );
  }

  getAllUsers(): void {
    this.resourceService.getAllUsers().subscribe(
      data => {
        console.log('Users received:', data);
        this.users = data;
        console.log('Users after assignment:', this.users);  // Vérifier que users est mis à jour

      },
      error => {
        console.error('Error fetching users', error);
      }
    );
  }
  openRoleDialog(user: User) {
    this.selectedUser = user;
    this.selectedRole = user.roles.length > 0 ? user.roles[0].name : ''; // Sélectionne le rôle actuel
    this.displayRoleDialog = true;
  }

  assignRole() {
    if (this.selectedUser && this.selectedRole) {
      const roleId = typeof this.selectedRole === 'object' ? (this.selectedRole as any)?.id : this.selectedRole;
      this.resourceService.assignRoleToUser(this.selectedUser.id, roleId).subscribe(
        () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Role assigned successfully' });
          this.getAllUsers(); 
          this.displayRoleDialog = false;
        },
        error => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to assign role' });
          console.error('Error assigning role:', error);
        }
      );
    }
  }

  openUserDialog(user: any) {
    this.selectedUser = user;
    this.displayUserDialog = true;
  }
  toggleUserStatus(user: User): void {
    if (user.enabled) {
      this.resourceService.activateUserAccount(user.id).subscribe(
        (updatedUser) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User account activated' });
        },
        (error) => {
          // En cas d'erreur, on remet l'état précédent
          user.enabled = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to activate user account' });
          console.error('Error activating user account:', error);
        }
      );
    } else {
      this.resourceService.deactivateUserAccount(user.id).subscribe(
        (updatedUser) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User account deactivated' });
        },
        (error) => {
          // En cas d'erreur, on remet l'état précédent
          user.enabled = true;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to deactivate user account' });
          console.error('Error deactivating user account:', error);
        }
      );
    }
  }
  searchUsers(): void {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.getAllUsers(); // Si la recherche est vide, affichez tous les utilisateurs
      return;
    }

    this.resourceService.searchUsers(this.searchTerm).subscribe(
      data => {
        this.users = data;
        this.messageService.add({
          severity: 'info',
          summary: 'Search Results',
          detail: `Found ${data.length} users`
        });
      },
      error => {
        console.error('Error searching users', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to search users'
        });
      }
    );
  }
  get paginatedUsers() {
    const start = this.currentPage * this.itemsPerPage;
    return this.users.slice(start, start + this.itemsPerPage);
  }
  
  onPageChange(event: any) {
    this.currentPage = event.page;
  }
}
