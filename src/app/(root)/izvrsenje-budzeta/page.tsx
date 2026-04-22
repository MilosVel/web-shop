
"use client";

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ContentLayout } from "@/components/layouts/content-layout"
import { FileSpreadsheet } from 'lucide-react';
import { DialogUploadIzvrsenjeBuzeta } from "@/features/izvrsenje-budzeta/components";
import { ExportExcel } from "@/shared/components/export-excel";
import { ExportJson } from "@/shared/components/export-json";
import { useState } from "react";
import type { IzvrsenjeBudzetaResult } from "@/features/izvrsenje-budzeta/dto";

export default function IzvrsenjeBudzetaPage() {
    const [izvrsenjeBuzetaResult, setIzvrsenjeBudzeta] = useState<IzvrsenjeBudzetaResult | null>(null);

    const handleDataProcessed = (data:IzvrsenjeBudzetaResult) => {
        setIzvrsenjeBudzeta(data);
    }

    console.log(izvrsenjeBuzetaResult?.izvrsenjeBudzetaZaISPFI)



    return (
        <ContentLayout routeTitle="Plan i izvrsenje">
            <div className="flex flex-row justify-around ju gap-4">
                <div className="flex flex-rpw gap-x-3">
                    <DialogUploadIzvrsenjeBuzeta
                        triggerButton={
                            <Button variant="outline" className="p-1 bg-transparent">
                                Insert excel document
                            </Button>
                        }
                        onDataProcessed={handleDataProcessed}
                    />
                    {izvrsenjeBuzetaResult && izvrsenjeBuzetaResult.izvrsenjeBuzetaPoKontima.length > 0 && (
                        <>
                            <ExportExcel 
                                data={izvrsenjeBuzetaResult.izvrsenjeBuzetaPoKontima} 
                                header={izvrsenjeBuzetaResult.excelHeader} 
                                fileName={'Plan i Izvrsenje izvestaj.xlsx'} 
                            />
                            <ExportJson 
                                data={izvrsenjeBuzetaResult.izvrsenjeBudzetaZaISPFI} 
                                fileName={'ISPFI-izvestaj.json'}
                                reportName="PFI1-2026-60990-2"
                            />
                        </>
                    )}
                </div>
            </div>
        </ContentLayout>
    )
}
