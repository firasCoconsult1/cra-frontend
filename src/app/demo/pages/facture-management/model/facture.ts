export interface Facture {

    idFacture: number;
    year: number;
    month: number;
    montantTotal: number;
    status: FactureStatus;
    reference: string;
    userId: number;
    craId: number;
    isSave: boolean;
}

export enum FactureStatus {
    PAYE = "PAYE",
    NON_PAYE = "NON_PAYE",
}

