import { Role } from "../../role-management/model/role";

export interface User{
    id: number;
    fullname: string;
    username: string;
    numeroTelephone: string;
    imageUrl: string;
    description: string;
    enabled: boolean;
    roles : Role [
       
    ];

}