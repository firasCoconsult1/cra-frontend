import { Component, NO_ERRORS_SCHEMA, OnInit, ViewChild } from '@angular/core';
import { RoleServiceService } from './role/role-service.service';
import { Permission, Role, RoleDto } from './model/role';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';


import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';

import { SelectModule } from 'primeng/select';
import { DropdownModule } from 'primeng/dropdown';

import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Page } from './model/page';

@Component({
  selector: 'app-role-management',
  templateUrl: './role-management.component.html',
  styleUrls: ['./role-management.component.scss'],
  imports: [TableModule, Dialog, SelectModule, ToastModule,
    ToolbarModule, ConfirmDialog, InputTextModule,
    TextareaModule, CommonModule, DropdownModule,
    InputTextModule, FormsModule, ButtonModule,
    IconFieldModule, InputIconModule, CheckboxModule,TooltipModule],
  providers: [MessageService, ConfirmationService],
  styles: [
    `:host ::ng-deep .p-dialog .product-image {
            width: 150px;
            margin: 0 auto 2rem auto;
            display: block;
        }`
  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class RoleManagementComponent implements OnInit {
  roles: Role[] = [];
  selectedRoles: Role[] = [];
  role: Role = { id: 0, name: '' };
  roleDialog: boolean = false;
  submitted: boolean = false;
  permissions: any[] = [];
  selectedPermissions: Set<number> = new Set();

  permission: Permission = { id: 0, name: '' };





  constructor(private roleService: RoleServiceService, private messageService: MessageService, private confirmationService: ConfirmationService) { }

  ngOnInit(): void {
    this.loadRoles();
    this.getPermissions();
  }

  loadRoles() {
    const page = 0;
    const size = 10;
    const sortBy = 'id';
    const direction = 'asc';

    this.roleService.getAllRoles(page, size, sortBy, direction)
      .subscribe((response: Page<Role>) => {
        this.roles = response.content.map(role => ({
          ...role,
          permissions: role.permissions || []
        }));
      });
  }


  openNew() {
    this.role = { id: 0, name: '' };
    this.submitted = false;
    this.roleDialog = true;
  }

  editRole(role: Role) {
    this.role = { ...role };

    this.selectedPermissions.clear();

    if (role.permissions && role.permissions.length > 0) {
      role.permissions.forEach(p => this.selectedPermissions.add(p.id));
    }

    this.roleDialog = true;
  }



  onPermissionChange(checked: boolean, permissionId: number) {
    if (checked) {
      this.selectedPermissions.add(permissionId);
    } else {
      this.selectedPermissions.delete(permissionId);
    }
  }

  deleteRole(role: Role) {
    this.confirmationService.confirm({
      message: `Do you want to delete the role ${role.name}?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.roleService.deleteRole(role.id).subscribe(() => {
          this.roles = this.roles.filter(val => val.id !== role.id);
          this.role = { id: 0, name: '' };
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Role deleted', life: 3000 });
        });
      }
    });
  }


  saveRole() {
    this.submitted = true;

    if (this.role.name.trim()) {
      const roleDto: RoleDto = {
        name: this.role.name,
        permissions: Array.from(this.selectedPermissions)
      };

      if (this.role.id) {
        this.roleService.updateRole(roleDto, this.role.id).subscribe(() => {
          this.loadRoles();
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Role updated', life: 3000 });
        });
      } else {
        this.roleService.addRole(roleDto).subscribe(() => {
          this.loadRoles();
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Role added', life: 3000 });
        });
      }

      this.roleDialog = false;
      this.role = { id: 0, name: '', permissions: [] };
      this.selectedPermissions.clear();
    }
  }

  hideDialog() {
    this.roleDialog = false;
    this.submitted = false;
  }

  getPermissions(): void {
    this.roleService.getPermissions().subscribe((data: any[]) => {
      this.permissions = data;
    });
  }
  getFormattedPermissions(permissions: any[]): string {
    if (!permissions || permissions.length === 0) {

      return 'No permissions';
    }
    return permissions.map(permission => permission.name).join(' / ');
  }


}
