"use client";
import { toast } from 'sonner';
import { zodResolver } from "@hookform/resolvers/zod";
import { UploadInput } from "@/components/ui/form/upload-input";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormIzvrsenjeBudzetaSubmitSchema, izvrsenjeBudzetaSumbitSchema, izvrsenjeHeaderMap } from "@/features/izvrsenje-budzeta/schemas";
import { readSchemaParsedExcelFile } from "@/utils/manage-file/read-schema-parsed-excel-file";
import { paymentItem, paymentItemSchema } from '@/features/spiri/payment/schemas';
import { createIzvrsenjeBudzeta } from "@/features/izvrsenje-budzeta/actions";
import { SKIP_ROWS_SPIRI } from '@/shared/constants';
import { Controller, useForm } from 'react-hook-form';
import { Input, Label } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch/switch';
import { useEffect } from 'react';
import { Select } from '@/components/ui/form/select';

import type { SelectOption } from '@/types';
import type { IzvrsenjeBudzetaResult, IspfiIzvestajData } from "@/features/izvrsenje-budzeta/dto";


export function PaymentFileForm({
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


            const paymentData = await readSchemaParsedExcelFile<paymentItem>({
                file: formValues.file,
                schema: paymentItemSchema,
                onProgress: (processed, total) => {
                    setPercentageUploaded(Math.round((processed / total) * 50));
                }
            });

            console.log(paymentData);


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