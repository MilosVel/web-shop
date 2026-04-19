
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ContentLayout } from "@/components/layouts/content-layout"
import { FileSpreadsheet } from 'lucide-react';
import { UploadDialogForPlanIIzvrsenje } from "@/features/plan-i-izvrsenje/components";



// import { ExportExcel } from "@/shared/components/export-excel";


export default async function PlanIIzvrsenjePage() {


    return (
        < ContentLayout routeTitle="Plan i izvrsenje" >
            <div className="flex flex-row justify-around ju gap-4">
                <div className="flex flex-rpw gap-x-3">
                    <UploadDialogForPlanIIzvrsenje
                        triggerButton={
                            <Button variant="outline" className="p-1 bg-transparent">
                                Insert excel document
                            </Button>
                        } />
                    {/* <ExportExcel data={planIIzvrsenje} header={PLAN_I_IZVRSENJE_HEADER} fileName={'Plan i Izvrsenje izvestaj.xlsx'} /> */}
                </div>
            </div>

        </ContentLayout >
    )
}
