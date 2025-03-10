import { Component, OnInit, ViewChild } from '@angular/core';
import { RoleServiceService } from './role/role-service.service';
//import { MatPaginator } from '@angular/material/paginator';
//import { MatTableDataSource } from '@angular/material/table';
import { Role } from './model/role';

@Component({
  selector: 'app-role-management',
  imports: [],
  templateUrl: './role-management.component.html',
  styleUrl: './role-management.component.scss'
})
export class RoleManagementComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'description'];
 /* dataSource = new MatTableDataSource<Role>();

  @ViewChild(MatPaginator) paginator: MatPaginator;*/
  constructor(private roleService: RoleServiceService) {}

  ngOnInit(): void {
    this.roleService.getRoles().subscribe((roles: Role[]) => {
      /*this.dataSource.data = roles;
      this.dataSource.paginator = this.paginator;*/
    });
  }


}
