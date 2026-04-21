"use server"

import { getCurrentUser } from "@/auth/nextjs/currentUser"

import { canInsertPlanIIzvrsenje } from "@/features/plan-i-izvrsenje/permissions";
import { planItem, izvrsenjeItem, izvorItem } from "@/features/plan-i-izvrsenje/schemas";


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

        // ── collect all unique izvor values sorted ──
        const allIzvori = izvoriData.map(item => item.izvor).sort();

        // ── Full outer join ──
        const allKeys = new Set([...izvrsenjeMap.keys(), ...planMap.keys()]);

        const planIIzvrsenje = Array.from(allKeys).map((key) => {
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
