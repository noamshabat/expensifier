import 'reflect-metadata'
import { cellValue, loadFolder, sheetMatch } from '../excel/utils'
import { DataGuide, SheetIdentifier } from '../identifiers/types'
import { TransactionOrigin, TransactionType } from '../../shared.types'
import { WorkSheet } from 'xlsx'
import { container } from '../..'
import { TYPES } from '../../types'
import { IStore } from '../../store/store.types'
import { IRunner } from './types'
import { injectable } from 'inversify'
import moment from 'moment'
import { RawTransaction } from '../types'

@injectable()
export class Runner implements IRunner {
    work: { id: SheetIdentifier, guide: DataGuide }[] = []
    
    private processGuides = (sheet: WorkSheet, guide: DataGuide) => {
        const store = container.get<IStore>(TYPES.IStore)

        const startRow = guide.startRow

        let rowIndex = startRow
        while (cellValue(sheet, rowIndex, guide.endRow.column) !== guide.endRow.value) {
            const entry: Partial<RawTransaction> = {}
            
            guide.columns.forEach((c) => {
                entry[c.name] = cellValue(sheet, rowIndex, c.number)
                if (c.valueGetter) entry[c.name] = c.valueGetter(entry[c.name] as string|number) 
            })
            entry.origin = guide.name as TransactionOrigin
            entry.type = entry.amount && entry.amount > 0 ? TransactionType.Income : TransactionType.Expense
            
            rowIndex++

            if (typeof entry.amount !== 'number' || typeof entry.description !== 'string') {
                console.error('Error entry', entry)
                continue
            }
            if (!entry.timestamp) {
                console.error('Error - Finished with entry column parsing and have no timestamp!', entry, rowIndex, guide)
                throw new Error('Error - Finished with entry column parsing and have no timestamp!')
            }

            // Add transaction effective month.
            if (guide.monthGetter) entry.month = guide.monthGetter(entry.timestamp, 'YYYY-MM')
            else entry.month = moment.unix(entry.timestamp / 1000).format('YYYY-MM')

            store.addTransaction(entry as RawTransaction)
        }
    }

    private process = (sheet: WorkSheet) => {
        this.work.forEach((w) => {
            if (sheetMatch(sheet, w.id)) {
                console.log('Found matching sheet for identifier', w.id.name)
                this.processGuides(sheet, w.guide)
            }
        })    
    }

    public registerIdentifier = (id: SheetIdentifier, guides: DataGuide) => {
        this.work.push({id, guide: guides})
    }

    public run = async (path: string) => {
        console.log('processing', path);
        (await loadFolder(path)).forEach((w) => {
            Object.values(w.Sheets).forEach((s) => this.process(s))
        })
    }
}