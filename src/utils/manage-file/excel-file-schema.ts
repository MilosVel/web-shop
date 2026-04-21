import { z } from "zod";
import { MAX_FILE_SIZE } from "@/shared/constants";


const ALLOWED_TYPES = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "application/octet-stream",
];

export const excelFileFileSchema = z.object({
    file: z
        .instanceof(File)
        .refine((file) => !!file, {
            message: "Excel file is required",
        })
        .refine((file) => file.size <= MAX_FILE_SIZE, {
            message: "File too large",
        })
        .refine(
            (file) => ALLOWED_TYPES.includes(file.type) ||
                file.type ===
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            {
                message: "Invalid file type. Only .xlsx files are allowed.",
            }
        ),
    ispfi_izvestaj: z.boolean(),
    IspfiFileName: z
    .string()
    .trim()
    .optional(),
}).refine((data) => {
    if (data.ispfi_izvestaj && (!data.IspfiFileName || data.IspfiFileName.trim() === '')) {
        return false;
    }
    return true;
}, {
    message: 'Ime fajla je obavezno kada je ISPFI izveštaj uključen',
    path: ['IspfiFileName'],
});

export type ExceFileFormSchema = z.infer<typeof excelFileFileSchema>;