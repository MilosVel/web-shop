import * as XLSX from "xlsx";
import { z } from "zod";
import { MAX_ROWS_IN_EXCEL_FILE, MAX_FILE_SIZE } from '@/shared/constants'


// ─── Error classes ─────────────────────────────────────────────────────────────

class ExcelValidationError extends Error {
    constructor(
        public errors: Array<{ row: number; error: string }>,
        message: string
    ) {
        super(message);
        this.name = 'ExcelValidationError';
    }
}

class ExcelProcessingError extends Error {
    constructor(message: string, public cause?: Error) {
        super(message);
        this.name = 'ExcelProcessingError';
    }
}

// ─── Interfaces ────────────────────────────────────────────────────────────────

interface ValidationError {
    row: number;
    error: string;
    rawData?: Record<string, unknown>;
}

export interface SheetOptions<T> {
    schema: z.ZodType<T>;
    skipRows?: number;
    headerMap?: Record<string, string>;
    maxRows?: number;
    sheetIndex?: number;
    onProgress?: (processed: number, total: number) => void;

    lenient?: boolean;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function validateFile(file: File): void {
    if (!file)
        throw new ExcelProcessingError("No file provided");

    if (!file.name.match(/\.(xlsx|xls)$/i))
        throw new ExcelProcessingError("Only Excel files (.xlsx, .xls) are supported");

    if (file.size === 0)
        throw new ExcelProcessingError("File is empty");

    if (file.size > MAX_FILE_SIZE)
        throw new ExcelProcessingError(
            `File too large`
        );
}

function mapExcelRow(
    row: Record<string, unknown>,
    headerMap?: Record<string, string>
): Record<string, unknown> {
    if (!headerMap) return row;

    const mapped: Record<string, unknown> = {};
    for (const [originalKey, value] of Object.entries(row)) {
        const mappedKey = headerMap[originalKey] ?? originalKey;
        mapped[mappedKey] = value;
    }
    return mapped;
}

function formatValidationErrors<T>(errors: z.ZodError<T>): string {
    return errors.issues
        .map(e => `${e.path.join('.')}: ${e.message}`)
        .join(', ');
}

function parseSheet<T>(workbook: XLSX.WorkBook, options: SheetOptions<T>): T[] {
    const {
        schema,
        skipRows = 0,
        headerMap,
        maxRows = MAX_ROWS_IN_EXCEL_FILE,
        sheetIndex = 0,
        onProgress,
        lenient = false,
    } = options;

    const sheetName = workbook.SheetNames[sheetIndex];
    if (!sheetName)
        throw new ExcelProcessingError(`No worksheet found at index ${sheetIndex}`);

    const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        defval: '',
        range: skipRows,
    }) as Record<string, unknown>[];

    if (rawData.length === 0) return [];


    if (rawData.length > maxRows)
        throw new ExcelProcessingError(
            `Sheet ${sheetIndex} too large: ${rawData.length} rows (max ${maxRows})`
        );

    const validatedData: T[] = [];
    const errors: ValidationError[] = [];

    for (let index = 0; index < rawData.length; index++) {
        const mappedRow = mapExcelRow(rawData[index], headerMap);
        const result = schema.safeParse(mappedRow);

        if (result.success) {
            validatedData.push(result.data);
        } else if (lenient) {
            // silently skip — could be a footer, signature row, etc.
        } else {
            errors.push({
                row: index + 1,
                error: formatValidationErrors(result.error),
                rawData: mappedRow,
            });
        }

        if (onProgress && (index + 1) % 100 === 0) {
            onProgress(index + 1, rawData.length);
        }
    }

    onProgress?.(rawData.length, rawData.length);

    if (errors.length > 0) {
        const errorMessage = errors
            .slice(0, 5)
            .map(e => `Row ${e.row}: ${e.error}`)
            .join('\n');

        throw new ExcelValidationError(
            errors,
            `Sheet ${sheetIndex} validation failed for ${errors.length} rows:\n${errorMessage}${errors.length > 5 ? '\n...and more' : ''}`
        );
    }

    return validatedData;
}

async function parseWorkbook(file: File): Promise<XLSX.WorkBook> {
    validateFile(file);
    try {
        const buffer = await file.arrayBuffer();
        return XLSX.read(buffer, { type: "array" });
    } catch (error) {
        if (error instanceof ExcelProcessingError) throw error;
        throw new ExcelProcessingError(
            `Failed to read file: ${(error as Error).message}`,
            error as Error
        );
    }
}

// Multiple sheets - workbook parsed once
export async function readMultipleExcelSheets<T extends unknown[]>(
    file: File,
    sheets: { [K in keyof T]: SheetOptions<T[K]> }
): Promise<{ [K in keyof T]: T[K][] }> {
    const workbook = await parseWorkbook(file);

    try {
        return sheets.map((sheetOptions) =>
            parseSheet(workbook, sheetOptions)
        ) as { [K in keyof T]: T[K][] };
    } catch (error) {
        if (error instanceof ExcelValidationError || error instanceof ExcelProcessingError) throw error;
        throw new ExcelProcessingError(
            `Failed to process file: ${(error as Error).message}`,
            error as Error
        );
    }
}

// Single sheet - thin wrapper, keeps existing call signature intact
export async function readSchemaParsedExcelFile<T>(
    options: SheetOptions<T> & { file: File }
): Promise<T[]> {
    const { file, ...sheetOptions } = options;
    const [data] = await readMultipleExcelSheets<[T]>(file, [{ ...sheetOptions }]);
    return data;
}
