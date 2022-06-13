import { cellValue, loadFolder, sheetMatch } from '../excel/utils'
import { DataGuide, SheetIdentifier } from '../identifiers/type'
import { ITransaction, TransactionOrigins, TransactionType } from '../types'
import { store } from '../../store/store'
import { WorkSheet } from 'xlsx'

export function Runner() {
    
    const work: { id: SheetIdentifier, guide: DataGuide }[] = []
    
    const processGuides = (sheet: WorkSheet, guide: DataGuide) => {
        const startRow = guide.startRow
        const entries: ITransaction[] = []

        let rowIndex = startRow
        while (cellValue(sheet, rowIndex, guide.endRow.column) !== guide.endRow.value) {
            const entry: Partial<ITransaction> = {}
            let skip = false
            
            guide.columns.forEach((c) => {
                entry[c.name] = cellValue(sheet, rowIndex, c.number)
                if (c.func) entry[c.name] = c.func(entry[c.name] as string|number) 
                if (c.filters && c.filters.includes(entry[c.name] as string)) skip = true
            })
            entry.origin = guide.name as TransactionOrigins
            entry.type = entry.amount && entry.amount > 0 ? TransactionType.Income : TransactionType.Expense
            if (!skip) entries.push(entry as ITransaction)
            
            rowIndex++
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

    const process = (sheet: WorkSheet) => {
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
            Object.values(w.Sheets).forEach((s) => process(s))
            // w.eachSheet((s) => process(s))
        })
    }

    return {
        registerIdentifier,
        run
    }
}