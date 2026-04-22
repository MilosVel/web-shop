"use server"

import { getCurrentUser } from "@/auth/nextjs/currentUser"

import { canInsertPlanIIzvrsenje } from "@/features/izvrsenje-budzeta/permissions";
import { planItem, izvrsenjeItem, izvorItem } from "@/features/izvrsenje-budzeta/schemas";
import { AOP_ARRAY } from "@/features/izvrsenje-budzeta/constants";


import type { IzvrsenjeGrouped, PlanGrouped, GroupAndMergeResult, MergedRow } from "@/features/izvrsenje-budzeta/dto";

export async function createIzvrsenjeBudzeta(izvrsenjeData: izvrsenjeItem[], planData: planItem[], ibkSet: Set<string>, izvoriData: izvorItem[]) {

    const izvrsenjeBuzeta: any[] = []

    const jsonIzvrsenjeBuzetaArray: Record<string, number[]> = {}

    const user = await getCurrentUser({ redirectIfNotFound: true })  // nece da radi bez ->   { redirectIfNotFound: true }   Proveriti zasto !!!!

    if (!canInsertPlanIIzvrsenje(user) && false) { // !!!!
        // if (!canInsertPlanIIzvrsenje(user)) { // !!!!
        throw new Error(`Inserting table error. (Zbog permisja user mora biti admin a trenutni user je: ${user.role})`);
    }


    function groupAndMerge(
        izvrsenjeData: izvrsenjeItem[],
        planData: planItem[],
    ): GroupAndMergeResult {

        // Helper function to safely get numeric value from izvrsenje row
        const getIzvrsenjeValue = (izvrsenjeRow: IzvrsenjeGrouped | undefined, izvor: string): number => {
            return izvrsenjeRow ? Number(izvrsenjeRow[izvor] ?? 0) : 0;
        };

        // Helper function to merge aop columns, summing values for duplicate keys
        const mergeAopColumns = (izvrsenjeRow: IzvrsenjeGrouped | undefined, izvoriData: izvorItem[]): Record<string, number> => {
            const result: Record<string, number> = {};

            izvoriData.forEach(aop => {
                const value = getIzvrsenjeValue(izvrsenjeRow, aop.izvor);
                const column = aop.ispfi_kolona;

                // Sum values for duplicate columns
                result[column] = (result[column] || 0) + value;
            });

            return result;
        };

        // ── Group izvrsenje by first 4 digits of konto ──
        const izvrsenjeMap = new Map<string, IzvrsenjeGrouped>();


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
                } as IzvrsenjeGrouped);
            }
        });

        // ── Group plan by first 4 digits of konto ──
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


        // ── collect all unique izvor values sorted ──
        const allIzvori = izvoriData.map(item => item.izvor).sort();

        // ── Full outer join ──
        const allKonta = new Set([...izvrsenjeMap.keys(), ...planMap.keys()]);


        const izvrsenjeBuzetaPoKontima = Array.from(allKonta).map((key) => {


            const izvrsenjeRow = izvrsenjeMap.get(key);
            const planRow = planMap.get(key);

            const izvorColumns = Object.fromEntries(
                allIzvori.map(izvor => [
                    izvor,
                    getIzvrsenjeValue(izvrsenjeRow, izvor),
                ])
            );

            ////////////////////////////////////

            const aopColumns = mergeAopColumns(izvrsenjeRow, izvoriData);

            const izvrsenjeBudzeta = {
                konto: key,
                plan: planRow?.plan ?? 0,
                ...aopColumns,
                ukupno: izvrsenjeRow?.ukupno ?? 0,
            }


            izvrsenjeBuzeta.push(izvrsenjeBudzeta)

            const {plan, konto, ukupno, ...rest} = izvrsenjeBudzeta
            const aopValue = AOP_ARRAY.find(item => item.konto === +izvrsenjeBudzeta.konto)?.aop;
            if (aopValue) {
                // Create array with fixed structure: [plan, 0, 0, 0, 0, 0, ukupno]
                const aopItemforJSON = [plan, 0, 0, 0, 0, 0, ukupno];
                
                // Map rest keys to indices (1-5) and set values
                Object.entries(rest as Record<string, number>).forEach(([key, value]) => {
                    const index = parseInt(key);
                    if (index >= 1 && index <= 5) {
                        aopItemforJSON[index] = value;
                    }
                });
                
                // Add to the result object with AOP as key
                jsonIzvrsenjeBuzetaArray[aopValue.toString()] = aopItemforJSON;
            }
            

            return {
                konto: key,
                plan: planRow?.plan ?? 0,
                ...izvorColumns,
                ukupno: izvrsenjeRow?.ukupno ?? 0,
            } as MergedRow;
        }).sort((a, b) => a.konto.localeCompare(b.konto));

        const header = ['konto', 'plan', ...allIzvori, 'ukupno'];

        return { izvrsenjeBuzetaPoKontima, header };
    }

    const { izvrsenjeBuzetaPoKontima, header } = groupAndMerge(izvrsenjeData, planData);

    console.log('izvrsenjeBuzeta', jsonIzvrsenjeBuzetaArray);


    return {
        izvrsenjeBuzetaPoKontima,
        header
    }

}
