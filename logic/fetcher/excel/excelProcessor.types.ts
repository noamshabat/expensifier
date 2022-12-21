import moment from "moment"
import { WorkBook, WorkSheet } from "xlsx"

export interface IExcelProcessor {
	loadFile: (path: string) => Promise<WorkBook>
	loadFiles: (files: { name: string }[]) => Promise<WorkBook[]>
	
	cellValue: (sheet: WorkSheet, row: number, col: number) => string
	cellCurrencyValue: (sheet: WorkSheet, row: number, col: number) => number
	cellDateValue: (sheet: WorkSheet, row: number, col: number, conversionFunc: (d: string) => moment.Moment) => moment.Moment
	isDate: (sheet: WorkSheet, row: number, col: number) => boolean
	getRawValues: <T>(sheet: WorkSheet, startRow: number, endRow: number, startCol: number, endCol: number) => T[]

	searchCell: (sheet: WorkSheet, startRow: number, endRow: number, startCol: number, endCol: number, search: string[]) => { row: number, col: number }|null
	sum: (sheet: WorkSheet, startRow: number, endRow: number, startCol: number, endCol: number) => number
}