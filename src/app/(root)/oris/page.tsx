
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ContentLayout } from "@/components/layouts/content-layout"
import { FileSpreadsheet } from 'lucide-react';
import { UploadDialog } from "@/features/oris/components/upload-dialog"

export default function SpiriPage() {
    return (
        < ContentLayout routeTitle="Generisane xml fajla za placanje i csv fajla za sifarnike" >
            <div className="flex flex-row justify-around ju gap-4">
                <div className="flex flex-rpw gap-x-3">
                    <UploadDialog
                        triggerButton={
                            <Button variant="outline" className="p-1 bg-transparent">
                                Create Oris file
                            </Button>
                        } />
                    {/* <ManageSifarnici
                        triggerButton={
                            <Button variant="outline" className="p-1 bg-transparent">
                                Sifarnici
                            </Button>
                        } /> */}

                </div>


                {/* <Button
                    icon={<FileSpreadsheet />}
                    className="bg-green-600 text-white"
                >
                    <a href="spiri/placanje/Placanje.xlsx" download>Primer fajla</a>
                </Button> */}
            </div>
        </ContentLayout >
    )
}





