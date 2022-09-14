import 'reflect-metadata'
import { inject, injectable } from 'inversify';
import { read, WorkBook, WorkSheet } from 'xlsx'
import { IExcelProcessor } from './excelProcessor.types';
import { ILogger } from '../../logger/types';
import moment from 'moment';
import { IFileManager } from '../../fs/fileManager.types';
import { LOGIC_TYPES } from '../../types';

@injectable()
export class ExcelProcessor implements IExcelProcessor {
    private logger: ILogger
    private fileMgr: IFileManager

    constructor(
        @inject(LOGIC_TYPES.ILogger) logger: ILogger,
        @inject(LOGIC_TYPES.IFileManager) fileMgr: IFileManager,
    ) {
        this.logger = logger
        this.fileMgr = fileMgr
    }

    private cellName = (row: number, col: number) => {
        const a = 'A'.charCodeAt(0)
        const colLetter = String.fromCharCode(a + col - 1)
        return `${colLetter}${row}`
    }

    cellObject = (sheet: WorkSheet, row: number, col: number) => {
        return sheet[this.cellName(row, col)]
    }

    cellValue = (sheet: WorkSheet, row: number, col: number) => {
        const cell = this.cellObject(sheet, row, col)
        if (!cell) return ''
        else return cell.w ? cell.w : cell.v
    }

    cellCurrencyValue = (sheet: WorkSheet, row: number, col: number): number => {
        const cell = this.cellObject(sheet, row, col)
        const type = typeof cell.v
        if (['number', 'bigint'].includes(type)) return cell.v
        if (type === 'boolean') return cell.v ? 1 : 0
        if (type !== 'string') throw new Error(`Unexpected cell type ${type} when expected currency`)

        // handling string. first remove anything that's not a number, comma, dot. then remove commas of large numbers
        const val = cell.v.match(/(?![-0-9]*)?(-?[0-9.,]+).*/)[0].replaceAll(',','')
        console.log(val)
        return parseFloat(val)
    }

    cellDateValue = (sheet: WorkSheet, row: number, col: number, conversionFunc: (d: string) => moment.Moment): moment.Moment => {
        const cell = this.cellObject(sheet, row, col)
        if (cell.v instanceof Date) return moment(cell.v)

        return conversionFunc(cell.w || cell.v)
    }

    isDate = (sheet: WorkSheet, row: number, col: number): boolean => {
        const cell = this.cellObject(sheet, row, col)
        return cell && cell.t === 'd'
    }

    searchCell = (sheet: WorkSheet, startRow: number, endRow: number, startCol: number, endCol: number, search: string[]): { row: number, col: number } | null => {
        for (let r = startRow; r < endRow; r++) {
            for (let c = startCol; c < endCol; c++) {
                if (search.includes(this.cellValue(sheet, r, c).trim())) return { row: r, col: c }
            }
        }
        return null
    }

    sum(sheet: WorkSheet, startRow: number, endRow: number, startCol: number, endCol: number): number {
        let sum = 0
        for (let r = startRow; r < endRow; r++) {
            for (let c = startCol; c < endCol; c++) {
                const val = this.cellCurrencyValue(sheet, r, c)
                if (typeof val === 'number') sum += val
            }
        }
        return sum
    }

    getRawValues<T>(sheet: WorkSheet, startRow: number, endRow: number, startCol: number, endCol: number): T[] {
        const ret: T[] = []
        for (let c = startCol; c < endCol; c++) {
            for (let r = startRow; r < endRow; r++) {
                ret.push(this.cellValue(sheet, r, c))
            }
        }
        return ret
    }

    loadFile = async (path: string): Promise<WorkBook> => {
        let workbook
        console.log('loading file ' + path)
        try {
            const data = await this.fileMgr.readfile(path)
            workbook = read(data, { raw: true })
        } catch (err) {
            console.log('Failed loading file', err)
            throw err
        }

        console.log('file loaded' + path)
        return workbook
    }

    loadFolder = async (path: string): Promise<WorkBook[]> => {
        const files = await this.fileMgr.readdir(path)
        console.log('files', files)
        //listing all files using forEach
        const xlsx = files.filter((file) => file.endsWith('.xlsx') || file.endsWith('.xls'));
        return Promise.all(xlsx.map((file) => this.loadFile(path + file)))
    }
}
