"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ContentLayout } from "@/components/layouts/content-layout";
import { FileSpreadsheet } from "lucide-react";
import { DialogUploadIzvrsenjeBuzeta } from "@/features/izvrsenje-budzeta/components";
import { ExportExcel } from "@/shared/components/export-excel";
import { ExportJson } from "@/shared/components/export-json";
import { useState } from "react";
import type {
  IzvrsenjeBudzetaResult,
  IspfiIzvestajData,
} from "@/features/izvrsenje-budzeta/dto";


export default function IzvrsenjeBudzetaPage() {
  const [izvrsenjeBuzetaResult, setIzvrsenjeBudzeta] = useState<
    (IzvrsenjeBudzetaResult & IspfiIzvestajData) | null
  >(null);


  const handleDataProcessed = (
    data: IzvrsenjeBudzetaResult & IspfiIzvestajData,
  ) => {
    setIzvrsenjeBudzeta(data);
  };

  return (
    <ContentLayout routeTitle="Plan i izvrsenje">
      <div className="flex flex-row justify-start gap-24">
        <div className="gap-x-3 border-2 rounded border-gray-100">
        
           <a
          className="group bg-white px-7 py-3 flex items-center gap-2 rounded-full outline-none focus:scale-110 hover:scale-110 active:scale-105 transition cursor-pointer borderBlack dark:bg-white/10"
          href='/Uputstvo.xlsx'
          download
        >
          Preuzmi Uptstvo{" "}
          <FileSpreadsheet className="opacity-60 group-hover:translate-y-1 transition" />
        </a>
 </div>
        <div className="flex flex-rpw gap-x-3">
          <DialogUploadIzvrsenjeBuzeta
            triggerButton={
              <Button variant="outline" className="p-1 bg-transparent">
                Insert excel document
              </Button>
            }
            onDataProcessed={handleDataProcessed}
          />
          {izvrsenjeBuzetaResult &&
            izvrsenjeBuzetaResult.izvrsenjeBuzetaPoKontima.length > 0 && (
              <>
                <ExportExcel
                  data={izvrsenjeBuzetaResult.izvrsenjeBuzetaPoKontima}
                  header={izvrsenjeBuzetaResult.excelHeader}
                  fileName={"Plan i Izvrsenje izvestaj.xlsx"}
                />
                {izvrsenjeBuzetaResult.createizvrsenjeBudzetaZaISPFI && (
                  <ExportJson
                    data={izvrsenjeBuzetaResult.izvrsenjeBudzetaZaISPFI}
                    reportName={izvrsenjeBuzetaResult.name}
                    period={izvrsenjeBuzetaResult.reportTypePeriodId}
                  />
                )}
              </>
            )}
        </div>
      </div>
    </ContentLayout>
  );
}
