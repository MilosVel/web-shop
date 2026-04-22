'use client'

import { Button } from '@/components/ui/button'

interface ExportJsonProps {
    data: Record<string, number[]>
    fileName?: string
    reportName?: string
}

export function ExportJson({
    data,
    fileName = 'report.json',
    reportName = 'PFI1-2026-60990-2'
}: ExportJsonProps) {
    const exportToJson = () => {
        if (!data || Object.keys(data).length === 0) {
            alert('No data to export.')
            return
        }

        // Build Form object with Header first, then add data keys
        const formObject: any = {
            Header: {
                Type: 25,
                Kind: 2
            }
        };
        
        // Add data keys after Header
        Object.keys(data).forEach(key => {
            formObject[key] = data[key];
        });

        const jsonStructure = {
            Header: {
                Name: reportName,
                OrganizationStatus: "None",
                OrganizationStatusChangedDate: null,
                Description: "",
                ReportTypePeriodId: 1
            },
            Forms: [formObject]
        }

        const jsonString = JSON.stringify(jsonStructure, null, 2)
        const blob = new Blob([jsonString], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    return (
        <Button variant="outline" className="p-1 bg-transparent" onClick={exportToJson}>
            Export to JSON - {fileName}
        </Button>
    )
}
