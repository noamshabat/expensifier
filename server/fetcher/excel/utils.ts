import { promises as fs } from 'fs';
import { SheetIdentifier } from '../identifiers/type';
import { readFile, WorkBook, WorkSheet } from 'xlsx'

export const cellName = (row: number, col: number) => {
    const a = 'A'.charCodeAt(0)
    const colLetter = String.fromCharCode(a + col - 1)
    return `${colLetter}${row}`
}

export const cellValue = (sheet: WorkSheet, row: number, col: number) => {
    const cell = sheet[cellName(row, col)]
    if (!cell) return ''
    else return cell.w ? cell.w : cell.v
}

export const loadFile = async (path: string): Promise<WorkBook> => {
    let workbook // = new Workbook();
    console.log('loading file ' + path)
    try {
        // await workbook.xlsx.readFile(path);
        workbook = readFile(path, { raw: true })
    } catch (err) {
        console.log('Failed loading file', err)
        throw err
    }
    
    console.log('file loaded' + path)
    return workbook
}

export const loadFolder = async (path: string): Promise<WorkBook[]> => {
    const files = await fs.readdir(path)
    //listing all files using forEach
    const xlsx = files.filter((file) => file.endsWith('.xlsx') || file.endsWith('.xls'));
    return Promise.all(xlsx.map((file) => loadFile(path + file)))
}

export const sheetMatch = (sheet: WorkSheet, identifier: SheetIdentifier) => {
    if (!identifier.cells/* && !identifier.views */) {
        console.error('Empty identifier will never match')
    }
    if (identifier.cells) {
        // const mismatches = identifier.cells.filter((c) => sheet.getCell(c.row, c.column).value !== c.value).length
        
        const mismatches = identifier.cells.filter((c) => cellValue(sheet, c.row, c.column) !== c.value).length
        if (mismatches > 0) return false
    }

    return true
}