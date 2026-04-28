import { z } from "zod";

export const fizickoLiceSchema = z.object({
    JMBG: z
        .string()
        .min(13, "JMBG mora imati tačno 13 cifara")
        .max(13, "JMBG mora imati tačno 13 cifara"),

    budget_user_id: z
        .string()
        .min(1, "budget_user_id je obavezan"),

    recipient: z
        .string()
        .min(1, "recipient je obavezan"),

    recipient_place: z
        .string()
        .min(1, "recipient_place je obavezan"),

    address: z
        .string()
        .min(1, "address je obavezan"),

    account_number: z
        .string()
        .min(18, "account_number mora imati tačno 18 cifara")
        .max(18, "account_number mora imati tačno 18 cifara"),

    banka: z
        .string()
        .min(1, "banka je obavezna"),
});


export type fizickoLice = z.infer<typeof fizickoLiceSchema>;
