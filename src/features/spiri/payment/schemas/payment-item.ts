import { z } from "zod";

import { fizickoLiceSchema } from "@/features/spiri/sifarnici/schemas";

export const pickedFizickoLiceSchema = fizickoLiceSchema.pick({
    recipient_place: true,
    recipient: true,
    account_number: true,
    budget_user_id: true,
});

export const paymentItemSchema =
    pickedFizickoLiceSchema.extend({
        external_id: z.number().min(1, "external_id is required"),
        reason_code: z.string().min(1, "reason_code is required"),

        invoice_number: z.string().min(1, "invoice_number is required"),

        invoice_type: z.string().min(1, "invoice_type is required"),

        invoice_date: z.string().min(1, "invoice_date is required"),

        due_date: z.string().min(1, "due_date is required"),

        payment_code: z
            .string()
            .min(3, "payment_code must be exactly 3 characters")
            .max(3, "payment_code must be exactly 3 characters"),

        credit_reference_number: z.string().min(1, "credit_reference_number is required"),

        payment_basis: z.string().min(1, "payment_basis is required"),

        function_code: z
            .string()
            .min(3, "function_code must be exactly 3 characters")
            .max(3, "function_code must be exactly 3 characters"),

        program_code: z
            .string()
            .min(4, "program_code must be exactly 4 characters")
            .max(4, "program_code must be exactly 4 characters"),

        project_code: z
            .string()
            .min(4, "project_code must be exactly 4 characters")
            .max(4, "project_code must be exactly 4 characters"),

        source_of_funding_code: z
            .string()
            .min(2, "source_of_funding_code must be exactly 2 characters")
            .max(2, "source_of_funding_code must be exactly 2 characters"),

        economic_classification_code: z
            .string()
            .min(6, "economic_classification_code must be exactly 6 characters")
            .max(6, "economic_classification_code must be exactly 6 characters"),

        amount: z.string().min(1, "amount is required"),

        expected_payment_date: z.string().min(1, "expected_payment_date is required"),

        urgent_payment: z.string().min(1, "urgent_payment is required"),

        posting_account: z
            .string()
            .min(6, "posting_account must be exactly 6 characters")
            .max(6, "posting_account must be exactly 6 characters"),

        credit_model: z.string().optional().default(''),
        contract_number: z.string().optional().default(''),
        sub_economic_classification_code: z.string().optional().default(''),


    });


export type paymentItem = z.infer<typeof paymentItemSchema>;
