import { WorkSheet } from "xlsx"
import { AccountType, Concrete, Immutable, RawTransaction, TransactionBaseData } from "../../shared.types"

export interface CellIdentifiers {
    row: number
    column: number
    value: string
}

// TODO: remove once SheetGuide is ready
export interface SheetIdentifier {
    name: string
    cells?: CellIdentifiers[]
}

// TODO: remove once SheetGuide is ready
export interface DataGuide {
    name: string
    startRow: number
    endRow: { column: number, value: string },
    columns: {
        name: keyof RawTransaction
        number: number
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        valueGetter?: (val: any) => any
    }[],
    monthGetter?: (timestamp: number, format: string) => string
}

export type SheetGuide = {
    name: string;
    identifiers: CellIdentifiers[];
    startRow?: number;
    endRow?: number;
    dateFormat: moment.MomentFormatSpecification;
    accountType: AccountType;
} & {
    [key in keyof TransactionBaseData]?: number;  // for each base data we need a number that identifies it
}

export type EnhancedSheetGuide = Immutable<Concrete<SheetGuide>>

export type BaseDataColumnOptions = {
    [key in keyof TransactionBaseData]: string[]
}

export interface ISheetIdentifier {
    init(): Promise<void>
    identify(sheet: WorkSheet): EnhancedSheetGuide
}

export interface IDateFormatAnalyzer {
    analyze(sheet: WorkSheet, column: number, startRow: number, endRow: number): string
}