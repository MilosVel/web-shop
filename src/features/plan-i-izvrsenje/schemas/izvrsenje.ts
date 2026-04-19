import { z } from "zod";

export const izvrsenjeHeaderMap = {
    'ЈБКЈС': 'jbkjs',
    'Ек. Кл.': 'konto',
    'Функција': 'funkcija',
    'Изв. Фин.': 'izvor',
    'Програм': 'program',
    'Пројекат': 'projekat',
    'Дугује Дин': 'duguje',
    'Потражује Дин': 'potrazuje',
    'Салдо Дин': 'saldo'
};


export const izvrsenjeSchema = z.object({
    jbkjs: z.union([z.string(), z.number()])
        .transform(val => String(val).trim())
        .refine(val => /^\d{5}$/.test(val), { message: "jbkjs must be exactly 5 digits" }),

    konto: z.union([z.string(), z.number()])
        .transform(val => String(val).trim())
        .refine(val => /^\d{6}$/.test(val), { message: "konto must be exactly 6 digits" }),

    funkcija: z.union([z.string(), z.number()]).transform(val => String(val).trim()),
    izvor: z.union([z.string(), z.number()]).transform(val => String(val).trim()),
    program: z.union([z.string(), z.number()]).transform(val => String(val).trim()),
    projekat: z.union([z.string(), z.number()]).transform(val => String(val).trim()),

    duguje: z.union([z.string(), z.number()])
        .transform(val => String(Number(val)))
        .refine(val => !Number.isNaN(Number(val)), { message: "duguje must be a valid number" }),

    potrazuje: z.union([z.string(), z.number()])
        .transform(val => String(Number(val)))
        .refine(val => !Number.isNaN(Number(val)), { message: "potrazuje must be a valid number" }),

    saldo: z.union([z.string(), z.number()])
        .transform(val => String(Number(val)))
        .refine(val => !Number.isNaN(Number(val)), { message: "saldo must be a valid number" }),
});

export type izvrsenjeItem = z.infer<typeof izvrsenjeSchema>;


