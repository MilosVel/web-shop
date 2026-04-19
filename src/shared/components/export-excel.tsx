'use client'

import * as XLSX from 'xlsx'
import { Button } from '@/components/ui/button'

interface ExportProps<T> {
    data: T[]
    fileName?: string
    header?:string[]
    sheet?: string
}

export function ExportExcel<T>({
    data,
    fileName = 'Report.xlsx',
    header,
    sheet= 'sheet 1'
}: ExportProps<T>) {
    const exportToExcel = () => {
        if (!data || data.length === 0) {
            alert('No data to export.')
            return
        }

        const worksheet = XLSX.utils.json_to_sheet(data,{header})
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, sheet)

        XLSX.writeFile(workbook, fileName)
    }

    return (
        <Button variant="outline" className="p-1 bg-transparent" onClick={exportToExcel}>
            Export to Excel - {fileName}
        </Button>
    )
}
