import { IRawTransaction } from '../types'

export interface CellIdentifiers {
    row: number
    column: number
    value: string
}


export interface SheetIdentifier {
    name: string
    cells?: CellIdentifiers[]
    // views?: Partial<WorksheetViewCommon>[]
}


export interface DataGuide {
    name: string
    startRow: number
    endRow: { column: number, value: string },
    columns: {
        name: keyof IRawTransaction
        number: number
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        valueGetter?: (val: any) => any
    }[],
    monthGetter?: (timestamp: number, format: string) => string
}
