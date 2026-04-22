import { z } from "zod";
import { excelFileFileSchema } from "@/utils/manage-file/excel-file-schema";



export const izvrsenjeBudzetaSumbitSchema = excelFileFileSchema.safeExtend({
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

export type FormIzvrsenjeBudzetaSubmitSchema = z.infer<typeof izvrsenjeBudzetaSumbitSchema>;