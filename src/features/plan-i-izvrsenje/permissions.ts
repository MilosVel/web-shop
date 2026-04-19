import { UserRole } from "@/drizzle/schema"

export function canInsertPlanIIzvrsenje({ role }: { role: UserRole | undefined }) {
    return role === "admin"
}
