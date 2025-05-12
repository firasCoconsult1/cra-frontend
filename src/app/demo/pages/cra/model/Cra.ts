import { Calendre } from "./Calendre";


export interface Cra {
    idCra: number;

    month: number;
    year: number;
    status: Status;
    calendres: Calendre[];
    send: boolean;
    commentaire: string;
    commentaireClient: string;

    userId: number;
}
export enum Status {
    VALIDE = "VALIDE",
    REJETE = "REJETE",
    IN_PROGRESS = "IN_PROGRESS"
}