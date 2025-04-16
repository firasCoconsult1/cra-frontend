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
import { TranslateModule, TranslateService } from '@ngx-translate/core';




@Component({
  selector: 'app-resource-management',
  imports: [TranslateModule, ChipModule, TooltipModule, PaginatorModule, DropdownModule, Dialog, Card, InputTextModule, ButtonModule, ToolbarModule, ToastModule, CommonModule, RadioButtonModule, FormsModule, InputGroupModule, InputIconModule, InputSwitchModule],
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
  filterOptions: any[] = [];



  pageSizeOptions = [
    { label: '5', value: 5 },
    { label: '10', value: 10 },
    { label: '20', value: 20 },
  ];

  totalUsers: number = 0;
  itemsPerPage: number = 5;
  selectedFilter: string | boolean = 'all';
  filteredUsersE: any[] = [];

  constructor(private translate: TranslateService, private roleService: RoleServiceService, private resourceService: ResourceManagementService, private messageService: MessageService, private confirmationService: ConfirmationService) { }
  ngOnInit(): void {
    this.loadFilterOptions();

    this.getAllUsers();
    this.getAllRoles();
    this.translate.onLangChange.subscribe(() => {
      this.loadFilterOptions();
    });
  }
  loadFilterOptions(): void {
    this.translate.get(['all', 'enabled', 'disabled']).subscribe(translations => {
      this.filterOptions = [
        { label: translations['all'], value: 'all' },
        { label: translations['enabled'], value: true },
        { label: translations['disabled'], value: false }
      ];
    });
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

  assignRole(): void {
    if (this.selectedUser && this.selectedRole) {
      const roleId = typeof this.selectedRole === 'object' ? (this.selectedRole as any)?.id : this.selectedRole;
      this.resourceService.assignRoleToUser(this.selectedUser.id, roleId).subscribe(
        () => {
          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('success.title'),
            detail: this.translate.instant('role_assigned_successfully')
          });
          this.getAllUsers();
          this.displayRoleDialog = false;
        },
        error => {
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('error.title'),
            detail: this.translate.instant('role_assignment_failed')
          });
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
    const action = user.enabled
      ? this.resourceService.activateUserAccount(user.id)
      : this.resourceService.deactivateUserAccount(user.id);

    action.subscribe(
      () => {
        const message = user.enabled
          ? this.translate.instant('user_account_activated')
          : this.translate.instant('user_account_deactivated');
        this.messageService.add({ severity: 'success', summary: this.translate.instant('success.title'), detail: message });
      },
      (error) => {
        user.enabled = !user.enabled;
        const errorMsg = user.enabled
          ? this.translate.instant('failed_to_activate')
          : this.translate.instant('failed_to_deactivate');
        this.messageService.add({ severity: 'error', summary: this.translate.instant('error.title'), detail: errorMsg });
        console.error('Error toggling user account:', error);
      }
    );
  }
  searchUsers(): void {
    if (!this.searchTerm.trim()) {
      this.getAllUsers();
      return;
    }

    this.resourceService.searchUsers(this.searchTerm).subscribe(
      data => {
        this.users = data;
        this.messageService.add({
          severity: 'info',
          summary: this.translate.instant('search_results'),
          detail: this.translate.instant('found_users', { count: data.length })
        });
      },
      error => {
        console.error('Error searching users', error);
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('error.title'),
          detail: this.translate.instant('search_failed')
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
    if (!this.emailInput || this.emailInput.trim() === '') {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('invalid_email'),
        detail: this.translate.instant('email_required')
      });
      return;
    }
  
    if (!this.isValidEmail(this.emailInput)) {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('invalid_email'),
        detail: this.translate.instant('enter_valid_email')
      });
      return;
    }
  
    if (this.emails.includes(this.emailInput)) {
      this.messageService.add({
        severity: 'warn',
        summary: this.translate.instant('duplicate_email'),
        detail: this.translate.instant('email_already_added')
      });
      return;
    }
  
    this.emails.push(this.emailInput);
    this.emailInput = '';
  }
  

  isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }


  inviteUser(): void {
    if (this.emails.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: this.translate.instant('warning'),
        detail: this.translate.instant('enter_at_least_one_email')
      });
      return;
    }
  
    this.resourceService.inviteUsers(this.emails).subscribe(
      () => {
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('success.title'),
          detail: this.translate.instant('invitations_sent')
        });
        this.emails = [];
        this.displayInvitationDialog = false;
      },
      error => {
        console.error('Error sending invitation email', error);
    
        let detailMessage = this.translate.instant('invitations_failed');
        if (error.error === 'User already exists.') {
          detailMessage = this.translate.instant('user_already_invited');
        }
    
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('error.title'),
          detail: detailMessage
        });
      }
    );
  }    
  
  removeEmail(email: string): void {
    const index = this.emails.indexOf(email);
    if (index > -1) {
      this.emails.splice(index, 1); 
    }

    if (this.emails.length === 0) {
      this.emails = []; 
    }
  }
}


