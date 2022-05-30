import { promises as fs } from 'fs';
import { Workbook, Worksheet, WorksheetView } from 'exceljs'
import { SheetIdentifier } from '../identifiers/type';

export const loadFile = async (path: string): Promise<Workbook> => {
    const workbook = new Workbook();
    await workbook.xlsx.readFile(path);
    return workbook
}

export const loadFolder = async (path: string): Promise<Workbook[]> => {
    const files = await fs.readdir(path)
    //listing all files using forEach
    const xlsx = files.filter((file) => file.endsWith('.xlsx'));
    return Promise.all(xlsx.map((file) => loadFile(path + file)))
}

export const sheetMatch = (sheet: Worksheet, identifier: SheetIdentifier) => {
    const match = true
    if (!identifier.cells && !identifier.views) {
        console.error('Empty identifier will never match')
    }
    if (identifier.cells) {
        const mismatches = identifier.cells.filter((c) => sheet.getCell(c.row, c.column).value !== c.value).length
        if (mismatches > 0) return false
    }
    if (identifier.views) {
        identifier.views.forEach((identifierView) => {
            const found = sheet.views.find((sheetView) => {
                const entries = Object.entries(identifierView)
                for (let i = 0 ; i < entries.length ; i++) {
                    const [key, value] = entries[i]
                    if (sheetView[key as keyof WorksheetView] !== value) return false 
                }
                return true
            })
            if (!found) return false
        })
    }
    return true
}