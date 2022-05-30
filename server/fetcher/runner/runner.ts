import { loadFolder, sheetMatch } from '../excel/utils'
import { Worksheet } from 'exceljs'
import { DataGuide, SheetIdentifier } from '../identifiers/type'
import { ITransaction, TransactionType } from '../types'
import { store } from '../../store/store'

export function Runner() {
    
    const work: { id: SheetIdentifier, guide: DataGuide }[] = []
    const processGuides = (sheet: Worksheet, guide: DataGuide) => {
        const startRow = guide.startRow
        const endRow = guide.endRow ? guide.endRow : sheet.rowCount

        const entries: ITransaction[] = []
        for (let rowIndex = startRow ; rowIndex <= endRow ; rowIndex++) {
            const entry: any = {}
            let skip = false
            guide.columns.forEach((c) => {
                entry[c.name] = sheet.getCell(rowIndex, c.number).value
                if (c.func) entry[c.name] = c.func(entry[c.name]) 
                if (c.filters && c.filters.includes(entry[c.name])) skip = true
            })
            entry.origin = guide.name
            entry.type = entry.amount > 0 ? TransactionType.Income : TransactionType.Expense
            if (!skip) entries.push(entry as ITransaction)
        }
        const toPush = entries.filter((e) => {
            if (typeof e.amount !== 'number' || typeof e.description !== 'string') {
                console.error('Error entry', e)
                return false
            }
            return true
        })
        store.records.push(...toPush)
        console.log('entries', toPush.length)
    }

    const process = (sheet: Worksheet) => {
        work.forEach((w) => {
            if (sheetMatch(sheet, w.id)) {
                console.log('Found matching sheet for identifier', w.id.name)
                processGuides(sheet, w.guide)
            }
        })    
    }

    const registerIdentifier = (id: SheetIdentifier, guides: DataGuide) => {
        work.push({id, guide: guides})
    }

    const run = async (path: string) => {
        (await loadFolder(path)).forEach((w) => {
            w.eachSheet((s) => process(s))
        })
    }

    return {
        registerIdentifier,
        run
    }
}