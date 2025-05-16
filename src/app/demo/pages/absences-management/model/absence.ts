import { DayAbsence } from "./dayAbsence";

export interface Absence {
    idAbsence: number;
    year: number;
    month: number;
    reason: string;
    isSend: boolean;
    status: AbsenceStatus;
    days: DayAbsence[];
    userId?: number;
    comment: string;
}

export enum AbsenceStatus {
    VALIDE = "VALIDE",
    REJETE = "REJETE",
    IN_PROGRESS = "IN_PROGRESS"
}


