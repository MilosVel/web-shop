
   export type IzvrsenjeGrouped = {
        jbkjs: string
        konto: string;
        ukupno: number
    } & Record<string, number>

    // export interface IzvrsenjeGrouped  {
    //     jbkjs: string
    //     konto: string;
    //     ukupno: number;
    //     [izvor: string]: string | number;
    // };

    export interface PlanGrouped {
        konto: string;
        plan: number;
    };



   export type MergedRow = {
        konto: string;
        ukupno: number;
        plan: number;
    } & Record<string, number>;

    // export interface MergedRow {
    //     konto: string;
    //     ukupno: number;
    //     plan: number;
    //     [izvor: string]: number;
    // };


    export interface GroupAndMergeResult {
        izvrsenjeBuzetaPoKontima: MergedRow[];
        header: string[];
    };
