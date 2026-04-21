"use server"

import { getCurrentUser } from "@/auth/nextjs/currentUser"

import { canInsertPlanIIzvrsenje } from "@/features/plan-i-izvrsenje/permissions";
import { planItem, izvrsenjeItem, izvorItem } from "@/features/plan-i-izvrsenje/schemas";
import { AOP_ARRAY } from "@/features/plan-i-izvrsenje/constants";


import type { IzvrsenjeGrouped, PlanGrouped, GroupAndMergeResult, MergedRow } from "@/features/plan-i-izvrsenje/dto";


export async function createPlanIIzvrsenje(izvrsenjeData: izvrsenjeItem[], planData: planItem[], ibkSet: Set<string>, izvoriData: izvorItem[]) {

    const user = await getCurrentUser({ redirectIfNotFound: true })  // nece da radi bez ->   { redirectIfNotFound: true }   Proveriti zasto !!!!

    if (!canInsertPlanIIzvrsenje(user) && false) { // !!!!
        // if (!canInsertPlanIIzvrsenje(user)) { // !!!!
        throw new Error(`Inserting table error. (Zbog permisja user mora biti admin a trenutni user je: ${user.role})`);
    }


    function groupAndMerge(
        izvrsenjeData: izvrsenjeItem[],
        planData: planItem[],
    ): GroupAndMergeResult {

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

        // 0
// This is example of izvoriData
// const izvoriData = [{izvor: '01', ispfi_kolona: '8'},
// {izvor: '07', ispfi_kolona: '6'},
// {izvor: '17', ispfi_kolona: '06'}];

        // ── collect all unique izvor values sorted ──
        const allIzvori = izvoriData.map(item => item.izvor).sort();
        const IspfiColumns= izvoriData.map(item => item.ispfi_kolona).sort();

        // ── Full outer join ──
        const allKonta = new Set([...izvrsenjeMap.keys(), ...planMap.keys()]);


// const izvrsenjeBuzeta = 
// Can you help me to create izvrsenjeBuzeta. Every konto ojb  in allKonta array has its aop in AOP_ARRAY. And I want to have this kind of structure
// {IzvrsenjeBuzdetaExcel: [{konto: some valeue, plan: some value, ....allIzvori and valies for respective izvor, ukupno:somevalue that reresetns summ of allIzvori values}]
// ispfiIzvrsenjeBuzeta: {
//     aop1: [plan: some value for this aop, ....IspfiColumns and valies for respective column, ukupno:somevalue that reresetns summ of all IspfiColumns values fro this aop],
//     ...
// }
// }
// and to cosnole.log(izvrsenjeBuzeta)









        const planIIzvrsenje = Array.from(allKonta).map((key) => {
            // Here you can easily map aop and konto

            const filteredAops = AOP_ARRAY.filter(item => {
                return item.konto === +key
            })

            const aop = filteredAops.find(item => {
                return item.konto === +key
            })    
                
      console.log(key,'konot',aop)



            const izvrsenjeRow = izvrsenjeMap.get(key);
            const planRow = planMap.get(key);

            const izvorColumns = Object.fromEntries(
                allIzvori.map(izvor => [
                    izvor,
                    izvrsenjeRow ? Number(izvrsenjeRow[izvor] ?? 0) : 0,
                ])
            );

            return {
                konto: key,
                plan: planRow?.plan ?? 0,
                ...izvorColumns,
                ukupno: izvrsenjeRow?.ukupno ?? 0,
            }  as MergedRow;
        }).sort((a, b) => a.konto.localeCompare(b.konto));

        const header = ['konto', 'plan', ...allIzvori, 'ukupno'];

        return { planIIzvrsenje, header };
    }

    const { planIIzvrsenje, header } = groupAndMerge(izvrsenjeData, planData);


    return {
        planIIzvrsenje,
        header
    }

}
