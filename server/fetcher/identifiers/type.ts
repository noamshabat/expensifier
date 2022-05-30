import { WorksheetViewCommon } from 'exceljs'
import { ITransaction } from '../types'

export interface CellIdentifiers {
    row: number
    column: number
    value: string
}


export interface SheetIdentifier {
    name: string
    cells?: CellIdentifiers[]
    views?: Partial<WorksheetViewCommon>[]
}


export interface DataGuide {
    name: string
    startRow: number
    endRow?: number
    columns: {
        name: keyof ITransaction
        number: number
        filters?: string[]
        func?: (val: any) => any
    }[]
}
