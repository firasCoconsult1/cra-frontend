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
import { ChipModule } from 'primeng/chip';

import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { Page } from '../role-management/model/page';
import { TooltipModule } from 'primeng/tooltip';
import { HttpParams } from '@angular/common/http';





@Component({
  selector: 'app-resource-management',
  imports: [ChipModule,TooltipModule,PaginatorModule, DropdownModule, Dialog, Card, InputTextModule, ButtonModule, ToolbarModule, ToastModule, CommonModule, RadioButtonModule, FormsModule, InputGroupModule, InputIconModule, InputSwitchModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './resource-management.component.html',
  styleUrl: './resource-management.component.scss'
})
export class ResourceManagementComponent implements OnInit {

  displayUserDialog: boolean = false;
  displayRoleDialog: boolean = false;
  displayInvitationDialog: boolean = false;
  selectedUser: User;
  selectedRole: string;
  roles: Role[] = [];
  searchTerm: string = '';
  filteredUsers: User[] = [];

  user: User;
  users: User[] = [];
  currentPage: number = 0;
  filterOptions = [
    { label: 'All', value: 'all' },
    { label: 'Enabled', value: true },
    { label: 'Disabled', value: false }
  ];

  pageSizeOptions = [
    { label: '5', value: 5 },
    { label: '10', value: 10 },
    { label: '20', value: 20 },
  ];
  
  totalUsers: number = 0; 
  itemsPerPage: number = 5; 
  selectedFilter: string | boolean = 'all'; 
  filteredUsersE: any[] = []; 

  constructor(private roleService: RoleServiceService, private resourceService: ResourceManagementService, private messageService: MessageService, private confirmationService: ConfirmationService) { }
  ngOnInit(): void {
    this.getAllUsers();
    this.getAllRoles();
  }
  getAllRoles(): void {
    const page = 0;
    const size = 10;
    const sortBy = 'id';
    const direction = 'asc';

    this.roleService.getAllRoles(page, size, sortBy, direction).subscribe(
      (response: Page<Role>) => {
        this.roles = response.content;
      },
      (error) => {
        console.error('Error fetching roles', error);
      }
    );
  }
  getInitials(username: string): string {
    return username.charAt(0).toUpperCase();
  }

  getAllUsers(): void {
    this.resourceService.getAllUsers(
      this.currentPage,
      this.itemsPerPage,
      'id',
      'asc'
    ).subscribe(
      (response: any) => {
        console.log('Pagination data received:', response);
        this.users = response.content;
        
        this.totalUsers = response.page.totalElements;
        
        this.filteredUsersE = [...this.users];
        
        
      },
      error => {
        console.error('Error fetching users', error);
      }
    );
  }


  
  onPageSizeChange(event: any): void {
    this.itemsPerPage = event.value;
    this.currentPage = 0; 
    this.getAllUsers(); 
  }
  openRoleDialog(user: any): void {
    this.selectedUser = user;


    if (user.roles && user.roles.length > 0) {
      this.selectedRole = user.roles[0].id;
    } else {
      this.selectedRole = null;
    }

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
  openInvitationDialog() {
    this.displayInvitationDialog = true;
  }
  toggleUserStatus(user: User): void {
    if (user.enabled) {
      this.resourceService.activateUserAccount(user.id).subscribe(
        (updatedUser) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User account activated' });
        },
        (error) => {
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
          user.enabled = true;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to deactivate user account' });
          console.error('Error deactivating user account:', error);
        }
      );
    }
  }
  searchUsers(): void {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.getAllUsers(); 
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
    console.log('Page changed:', event);
    this.currentPage = event.page;
    this.getAllUsers();
  }
  filterUsers(): void {
    if (this.selectedFilter === 'all') {
      this.filteredUsersE = [...this.users]; 
    } else {
      const isEnabled = this.selectedFilter === true;
      this.filteredUsersE = this.users.filter(user => user.enabled === isEnabled);
    }
  }
  emailInput: string = ''; 
  emails: string[] = [];   
  addEmail(event: any): void {
    if (this.emailInput && this.isValidEmail(this.emailInput)) {
      this.emails.push(this.emailInput);
      this.emailInput = '';  
    } else {
      this.messageService.add({ severity: 'error', summary: 'Invalid Email', detail: 'Please enter a valid email address.' });  
    }
  }

  
  isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }


inviteUser(): void {
  if (this.emails.length === 0) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Warning',
      detail: 'Please enter at least one email address'
    });
    return;
  }

  this.resourceService.inviteUsers(this.emails).subscribe(
    () => {
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Invitation(s) sent successfully'
      });
      this.emails = []; 
      this.displayInvitationDialog = false;
    },
    error => {
      console.error('Error sending invitation email', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to send invitation(s)'
      });
    }
  );
}
}


