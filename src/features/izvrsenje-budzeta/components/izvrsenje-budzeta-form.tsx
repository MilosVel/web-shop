"use client";
import { toast } from 'sonner';
import { zodResolver } from "@hookform/resolvers/zod";
import { UploadInput } from "@/components/ui/form/upload-input";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { excelFileFileSchema, ExceFileFormSchema } from "@/utils/manage-file/excel-file-schema";
import { FormIzvrsenjeBudzetaSubmitSchema, izvrsenjeBudzetaSumbitSchema} from "@/features/izvrsenje-budzeta/schemas";
import { readSchemaParsedExcelFile, readMultipleExcelSheets } from "@/utils/manage-file/read-schema-parsed-excel-file";
import { planSchema, planItem, izvrsenjeSchema, izvrsenjeHeaderMap, izvrsenjeItem, ibkItem, IbkSchema, izvorItem, IzvoriSchema } from "@/features/izvrsenje-budzeta/schemas";
import { createIzvrsenjeBudzeta } from "@/features/izvrsenje-budzeta/actions";
import { SKIP_ROWS_SPIRI } from '@/shared/constants';
import { Controller, useForm } from 'react-hook-form';
import { Input, Label } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch/switch';
import { useEffect } from 'react';

import type { GroupAndMergeResult } from "@/features/izvrsenje-budzeta/dto";

export function IzvrsenjeBudzetaForm({ 
    closeCreteTable, 
    onDataProcessed 
}: { 
    closeCreteTable: () => void;
    onDataProcessed?: (data:GroupAndMergeResult) => void;
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
        },
        resolver: zodResolver(izvrsenjeBudzetaSumbitSchema),
    });

    const ispfiIzvestajValue = watch('ispfi_izvestaj');
    
    useEffect(() => {
        if (!ispfiIzvestajValue) {
            clearErrors('IspfiFileName');
        }
    }, [ispfiIzvestajValue, clearErrors]);

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
            const IbkItems = await readSchemaParsedExcelFile<ibkItem>({
                file: formValues.file,
                schema: IbkSchema,
                sheetIndex: 2,
                lenient: true,
                onProgress: (processed, total) => {
                    setPercentageUploaded(50 + Math.round((processed / total) * 50));
                }
            });

            const ibkArray = new Set(IbkItems.map((item) => item.ibk))


          const IzvoriItems = await readSchemaParsedExcelFile<izvorItem>({
                file: formValues.file,
                schema: IzvoriSchema,
                sheetIndex: 3,
                lenient: true,
                onProgress: (processed, total) => {
                    setPercentageUploaded(50 + Math.round((processed / total) * 50));
                }
            });


            const {
                planIIzvrsenje,
                header
            } = await createIzvrsenjeBudzeta(izvrsenjeData, planData, ibkArray, IzvoriItems)

            // Call the callback to pass data to parent component
            if (onDataProcessed) {
                onDataProcessed({planIIzvrsenje, header});
            }

    

            setPercentageUploaded(100);
            toast.success('Podaci su uspešno obrađeni', {
                description: `Izvrsenje: ${izvrsenjeData.length} zapisa, Plan: ${planData.length} zapisa`,
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

       <Controller
                  control={control}
                  name="ispfi_izvestaj"
                  render={({ field }) => (
                    <div className="items-center flex gap-x-2 mt-4 justify-start">
                      <Label htmlFor="ispfi_izvestaj">ISPFI izveštaj</Label>
                      <Switch
                        id="ispfi_izvestaj"
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                        }}
                      />
                    </div>
                  )}
                />


        { ispfiIzvestajValue && 
        (<Input
            type="text"
            placeholder={'PI-123456-89'}
            label="Naziv ISPFI izvestaja"
            registration={register('IspfiFileName')}
            error={errors?.IspfiFileName}
            // onChange={(e) => console.log(e.target.value)}
            // registration={registration}
            // onFocus={handleInputFocus}
            // onBlur={handleInputFocus}
            />
            )}
            
            <div className="flex gap-x-4 justify-end">
                <Button variant="outline" onClick={closeCreteTable}>Close</Button>
                <Button type="submit" disabled={!isDirty || isProcessing}>
                    {isProcessing ? 'Processing...' : 'Upload'}
                </Button>
            </div>
        </form>
    );
}