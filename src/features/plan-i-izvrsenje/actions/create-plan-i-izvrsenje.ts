"use server"

import { getCurrentUser } from "@/auth/nextjs/currentUser"

import { canInsertPlanIIzvrsenje } from "@/features/plan-i-izvrsenje/permissions";
// import { insertIzvrsenje } from '@/features/plan-i-izvrsenje/izvrsenje/db/mutations/insert-izvrsenje'
import { planItem, izvrsenjeItem } from "@/features/plan-i-izvrsenje/schemas";

export async function createPlanIIzvrsenje(izvrsenjeData: izvrsenjeItem[], planData: planItem[]) {

    const user = await getCurrentUser({ redirectIfNotFound: true })  // nece da radi bez ->   { redirectIfNotFound: true }   Proveriti zasto !!!!


    if (!canInsertPlanIIzvrsenje(user) && false) { // !!!!
        throw new Error(`Inserting table error. (Zbog permisja user mora biti admin a trenutni user je: ${user.role})`);
    }

    // TO DO mergeArraysByKeys
    console.log('Izvrsenje data:', izvrsenjeData);
    console.log('Plan data:', planData);

    // const insertedData = await insertIzvrsenje(data)
    // redirect("/admin/products")

}
