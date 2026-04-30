"use client";
import { toast } from 'sonner';
import { zodResolver } from "@hookform/resolvers/zod";
import { UploadInput } from "@/components/ui/form/upload-input";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { excelFileFileSchema, ExceFileFormSchema } from "@/utils/manage-file/excel-file-schema";
import { FormIzvrsenjeBudzetaSubmitSchema, izvrsenjeBudzetaSumbitSchema } from "@/features/izvrsenje-budzeta/schemas";
import { readSchemaParsedExcelFile, readMultipleExcelSheets } from "@/utils/manage-file/read-schema-parsed-excel-file";
import { planSchema, planItem, izvrsenjeSchema, izvrsenjeHeaderMap, izvrsenjeItem, ibkItem, IbkSchema, izvorItem, IzvoriSchema } from "@/features/izvrsenje-budzeta/schemas";
import { createIzvrsenjeBudzeta } from "@/features/izvrsenje-budzeta/actions";
import { SKIP_ROWS_SPIRI } from '@/shared/constants';
import { Controller, useForm } from 'react-hook-form';
import { Input, Label } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch/switch';
import { useEffect } from 'react';
import { Select } from '@/components/ui/form/select';

import type { SelectOption } from '@/types';
import type { IzvrsenjeBudzetaResult, IspfiIzvestajData } from "@/features/izvrsenje-budzeta/dto";




export function OrisForm({
    onClose,
}: {
    onClose: () => void;
}) {
    const [percentageUploaded, setPercentageUploaded] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

    // Uzor   Cancel shift in CA
    const {
        handleSubmit,
        control,
        register,
        formState: { errors, isDirty },
        reset,
        getValues,
        clearErrors,
        watch
    } = useForm<FormIzvrsenjeBudzetaSubmitSchema>({
        defaultValues: {
            file: undefined,
            IspfiFileName: '',
            ispfi_izvestaj: false,
            reportTypePeriodId: undefined
        },
        resolver: zodResolver(izvrsenjeBudzetaSumbitSchema),
    });

    const ispfiIzvestajValue = watch('ispfi_izvestaj');

    useEffect(() => {
        if (!ispfiIzvestajValue) {
            clearErrors('IspfiFileName');
        }
    }, [ispfiIzvestajValue, clearErrors]);

    const handleFormSubmit = async (formValues: FormIzvrsenjeBudzetaSubmitSchema) => {
        try {
            setIsProcessing(true);


   



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

          
                    //   const xmlContent = await generatePaymentXmlFile(paymentData);
                    //   downloadFile(xmlContent, "Placanje.xml", "application/xml");
          
         


            setPercentageUploaded(100);
            toast.success('Podaci su uspešno obrađeni', {
                // description: `Izvrsenje: ${izvrsenjeData.length} zapisa, Plan: ${planData.length} zapisa`,
                duration: 7000,
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
            onClose();
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
                <Button variant="outline" onClick={onClose}>Close</Button>
                <Button type="submit" disabled={!isDirty || isProcessing}>
                    {isProcessing ? 'Processing...' : 'Upload'}
                </Button>
            </div>
        </form>
    );
}