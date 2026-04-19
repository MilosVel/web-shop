import { z } from "zod";

export const planSchema = z.object({
    konto: z.union([z.string(), z.number()])
        .transform(val => String(val).trim())
        .refine(val => /^\d{6}$/.test(val), { message: "konto must be exactly 6 digits" }),
    plan: z.union([z.string(), z.number()])
        .transform(val => String(Number(val)))
        .refine(val => !Number.isNaN(Number(val)), { message: "saldo must be a valid number" }),
});

export type planItem = z.infer<typeof planSchema>;