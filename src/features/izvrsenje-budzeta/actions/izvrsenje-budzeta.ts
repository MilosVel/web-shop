"use server"

import { getCurrentUser } from "@/auth/nextjs/currentUser"

import { canInsertPlanIIzvrsenje } from "@/features/izvrsenje-budzeta/permissions";
import { planItem, izvrsenjeItem, izvorItem } from "@/features/izvrsenje-budzeta/schemas";
import { AOP_ARRAY } from "@/features/izvrsenje-budzeta/constants";


import type { IzvrsenjeItem, PlanGrouped, IzvrsenjeBudzetaResult, IzvrsenjeBuzetaPoKontimaItem } from "@/features/izvrsenje-budzeta/dto";


const RAZLIKA_IZMEDJU_BROJA_ISPFI_KOLONE_I_INDEXA_ZA_AOP=5

export async function createIzvrsenjeBudzeta(izvrsenjeData: izvrsenjeItem[], planData: planItem[], ibkSet: Set<string>, izvoriData: izvorItem[]) {


    const jsonIzvrsenjeBuzetaForISPFI: Record<string, number[]> = {}

    const user = await getCurrentUser({ redirectIfNotFound: true })  // nece da radi bez ->   { redirectIfNotFound: true }   Proveriti zasto !!!!

    if (!canInsertPlanIIzvrsenje(user) && false) { // !!!!
        // if (!canInsertPlanIIzvrsenje(user)) { // !!!!
        throw new Error(`Inserting table error. (Zbog permisja user mora biti admin a trenutni user je: ${user.role})`);
    }


    function groupAndMergePlanIIzvrsenje(
        izvrsenjeData: izvrsenjeItem[],
        planData: planItem[],
    ): IzvrsenjeBudzetaResult {

        // Helper function to safely get numeric value from izvrsenje row
        const getIzvrsenjeValue = (izvrsenjeRow: IzvrsenjeItem | undefined, izvor: string): number => {
            return izvrsenjeRow ? Number(izvrsenjeRow[izvor] ?? 0) : 0;
        };

        // Helper function to merge aop columns, summing values for duplicate keys
        const getAopColumns = (izvrsenjeRow: IzvrsenjeItem | undefined, izvoriData: izvorItem[]): Record<string, number> => {
            const result: Record<string, number> = {};

            izvoriData.forEach(izvorItem => {
                const value = getIzvrsenjeValue(izvrsenjeRow, izvorItem.izvor);
                const column = izvorItem.ispfi_kolona;

                // Sum values for duplicate columns
                result[column] = (result[column] || 0) + value;
            });

            return result;
        };







        // ── izvrsenjeMap ──
        const izvrsenjeMap = new Map<string, IzvrsenjeItem>();


        izvrsenjeData.forEach((item) => {
            let konto = item.konto;

            if (ibkSet) {       // === IBK special logic ===
                if (ibkSet.has(item.jbkjs)) {
                    konto = item.konto.slice(2) + "00";
                }
            }

            const key = konto.slice(0, 4);
            const existing = izvrsenjeMap.get(key);
            const duguje = Number(item.duguje) || 0;

            if (existing) {
                existing[item.izvor] = (Number(existing[item.izvor] ?? 0) + duguje);
                existing.ukupno += duguje;
            } else {
                izvrsenjeMap.set(key, {
                    jbkjs: item.jbkjs,
                    konto: key,
                    ukupno: duguje,
                    [item.izvor]: duguje,
                } as IzvrsenjeItem);
            }
        });

        // ── planMap ──
        const planMap = new Map<string, PlanGrouped>();

        planData.forEach((item) => {
            const key = item.konto.slice(0, 4);
            const existing = planMap.get(key);
            const plan = Number(item.plan) || 0;

            if (existing) {
                existing.plan += plan;
            } else {
                planMap.set(key, { konto: key, plan });
            }
        });

        // ── allKonta from Plamn i Izvrsenje ──
        const allKonta = new Set([...izvrsenjeMap.keys(), ...planMap.keys()]);

        

        const allIzvori = izvoriData.map(item => item.izvor).sort();




        const izvrsenjeBuzetaPoKontima = Array.from(allKonta).map((konto) => {


            const izvrsenjeRow = izvrsenjeMap.get(konto);
            const planRow = planMap.get(konto);

            const izvoriIzvrsenjeColumns = Object.fromEntries(
                allIzvori.map(izvor => [
                    izvor,
                    getIzvrsenjeValue(izvrsenjeRow, izvor),
                ])
            );


    




            const plan =  planRow?.plan ?? 0
            const ukupno = izvrsenjeRow?.ukupno ?? 0

            const aopColumns = getAopColumns(izvrsenjeRow, izvoriData);

            const aopValue = AOP_ARRAY.find(item => item.konto === +konto)?.aop;

            if (aopValue) {
                // Create array with fixed structure: [plan, 0, 0, 0, 0, 0, ukupno]
                const aopItemForISPFIIzvrsenjeBudzeta = [plan, 0, 0, 0, 0, 0, ukupno];
                
                // Map rest keys to indices (1-5) and set values
                Object.entries(aopColumns).forEach(([brojISPFIkolone, value]) => {

                    const index = parseInt(brojISPFIkolone) - RAZLIKA_IZMEDJU_BROJA_ISPFI_KOLONE_I_INDEXA_ZA_AOP;

                    if (index >= 1 && index <= RAZLIKA_IZMEDJU_BROJA_ISPFI_KOLONE_I_INDEXA_ZA_AOP) {
                        aopItemForISPFIIzvrsenjeBudzeta[index] = value;
                    }else{
                        console.log('Greska: Index van opsega', index);
                    }

                });
                
                // Add to the result object with AOP as key
                jsonIzvrsenjeBuzetaForISPFI[aopValue.toString()] = aopItemForISPFIIzvrsenjeBudzeta;
            }
            

            

            return {
                konto: konto,
                plan: planRow?.plan ?? 0,
                ...izvoriIzvrsenjeColumns,
                ukupno: izvrsenjeRow?.ukupno ?? 0,
            } as IzvrsenjeBuzetaPoKontimaItem;
        }).sort((a, b) => a.konto.localeCompare(b.konto));

        const excelHeader = ['konto', 'plan', ...allIzvori, 'ukupno'];

        return { izvrsenjeBuzetaPoKontima, excelHeader };
    }

    const { izvrsenjeBuzetaPoKontima, excelHeader } = groupAndMergePlanIIzvrsenje(izvrsenjeData, planData);

    console.log('izvrsenjeBuzeta', jsonIzvrsenjeBuzetaForISPFI);


    return {
        izvrsenjeBuzetaPoKontima,
        excelHeader
    }

}
