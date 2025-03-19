export interface Role {
    id: number;
    name: string;
    permissions?: Permission[];
}

export interface Permission {
    id: number;
    name: string;
}

export interface RoleDto {
    name: string;
    permissions: number[]; 
  }