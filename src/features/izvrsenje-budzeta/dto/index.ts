
   export type IzvrsenjeItem = {
        jbkjs: string
        konto: string;
        ukupno: number
    } & Record<string, number>

    // export interface IzvrsenjeItem  {
    //     jbkjs: string
    //     konto: string;
    //     ukupno: number;
    //     [izvor: string]: string | number;
    // };

    export interface PlanGrouped {
        konto: string;
        plan: number;
    };



   export type IzvrsenjeBuzetaPoKontimaItem = {
        konto: string;
        ukupno: number;
        plan: number;
    } & Record<string, number>;

    // export interface IzvrsenjeBuzetaPoKontimaItem {
    //     konto: string;
    //     ukupno: number;
    //     plan: number;
    //     [izvor: string]: number;
    // };


    export interface IzvrsenjeBudzetaResult {
        izvrsenjeBuzetaPoKontima: IzvrsenjeBuzetaPoKontimaItem[];
        header: string[];
    };
