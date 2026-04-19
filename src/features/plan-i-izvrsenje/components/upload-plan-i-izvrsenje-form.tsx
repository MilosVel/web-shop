"use client";
import { toast } from 'sonner';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UploadInput } from "@/components/ui/form/upload-input";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { excelFileFileSchema, ExceFileFormSchema } from "@/utils/manage-file/excel-file-schema";
import { readSchemaParsedExcelFile, readMultipleExcelSheets } from "@/utils/manage-file/read-schema-parsed-excel-file";
import { planSchema, planItem, izvrsenjeSchema, izvrsenjeHeaderMap, izvrsenjeItem } from "@/features/plan-i-izvrsenje/schemas";
import { createPlanIIzvrsenje } from "@/features/plan-i-izvrsenje/actions";
import { SKIP_ROWS_SPIRI } from '@/shared/constants';

export function UploadPlanIIzvrsenjeDataForm({ closeCreteTable }: { closeCreteTable: () => void }) {
    const [percentageUploaded, setPercentageUploaded] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

    const {
        handleSubmit,
        control,
        formState: { errors, isDirty },
        reset,
    } = useForm<ExceFileFormSchema>({
        defaultValues: {
            file: undefined,
        },
        resolver: zodResolver(excelFileFileSchema),
    });

    const handleFormSubmit = async (formValues: ExceFileFormSchema) => {
        try {
            setIsProcessing(true);


            // const [izvrsenjeData, planData] = await readMultipleExcelSheets<[izvrsenjeItem, planItem]>(
            //     formValues.file,
            //     [
            //         {
            //             schema: izvrsenjeSchema,
            //             headerMap: izvrsenjeHeaderMap,
            //             sheetIndex: 0,
            //             skipRows: SKIP_ROWS_SPIRI,   // skip logo/title/totals block so row 8 becomes the header
            //             lenient: true,
            //             onProgress: (processed, total) => {
            //                 setPercentageUploaded(Math.round((processed / total) * 50));
            //             }
            //         },
            //         {
            //             schema: planSchema,
            //             sheetIndex: 1,
            //             lenient: true,
            //             onProgress: (processed, total) => {
            //                 setPercentageUploaded(50 + Math.round((processed / total) * 50));
            //             }
            //         },
            //     ]
            // );




            const izvrsenjeData = await readSchemaParsedExcelFile<izvrsenjeItem>({
                file: formValues.file,
                schema: izvrsenjeSchema,
                headerMap: izvrsenjeHeaderMap,
                sheetIndex: 0,
                skipRows: SKIP_ROWS_SPIRI,   // skip logo/title/totals block so row 8 becomes the header
                lenient: true,
                onProgress: (processed, total) => {
                    setPercentageUploaded(Math.round((processed / total) * 50));
                }
            });

            const planData = await readSchemaParsedExcelFile<planItem>({
                file: formValues.file,
                schema: planSchema,
                sheetIndex: 1,
                lenient: true,
                onProgress: (processed, total) => {
                    setPercentageUploaded(50 + Math.round((processed / total) * 50));
                }
            });


            createPlanIIzvrsenje(izvrsenjeData, planData)

            // console.log('Izvrsenje data:', izvrsenjeData);
            // console.log('Plan data:', planData);


            setPercentageUploaded(100);
            toast.success('Podaci su uspešno učitani!', { // Ovaj toast nije kompatibilan ako user nema permisije ****
                description: `Izvrsenje: ${izvrsenjeData.length} zapisa, Plan: ${planData.length} zapisa`,
                duration: 3000,
            });

            reset();
        } catch (err) {
            console.error('Error during upload:', err);
            toast.error('Greška pri učitavanju', {
                description: err instanceof Error ? err.message : 'Nepoznata greška',
                duration: 5000,
            });
        } finally {
            setIsProcessing(false);
            closeCreteTable();
        }
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <UploadInput
                label="Upload Excel File"
                name="file"
                control={control}
                accept=".xlsx, .xls"
                error={errors.file as any}
                percentageUploaded={percentageUploaded}
            />
            <div className="flex gap-x-4 justify-end">
                <Button variant="outline" onClick={closeCreteTable}>Close</Button>
                <Button type="submit" disabled={!isDirty || isProcessing}>
                    {isProcessing ? 'Processing...' : 'Upload'}
                </Button>
            </div>
        </form>
    );
}