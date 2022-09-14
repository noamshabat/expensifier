import 'reflect-metadata'
import { EnhancedSheetGuide, ISheetIdentifier } from '../identifiers/identifier.types'
import { AccountType, RawTransaction, TransactionType } from '../../shared.types'
import { WorkSheet } from 'xlsx'
import { IStore } from '../../store/store.types'
import { IRunner } from './types'
import { inject, injectable } from 'inversify'
import { IExcelProcessor } from '../excel/excelProcessor.types'
import moment from 'moment'
import { LOGIC_TYPES } from '../../types'

@injectable()
export class Runner implements IRunner {
    private excelProcessor: IExcelProcessor
    private sheetIdentifier: ISheetIdentifier
    private store: IStore

    constructor(
        @inject(LOGIC_TYPES.IExcelProcessor) excelProcessor: IExcelProcessor,
        @inject(LOGIC_TYPES.ISheetIdentifier) sheetIdentifier: ISheetIdentifier,
        @inject(LOGIC_TYPES.IStore) store: IStore
    ) {
        this.excelProcessor = excelProcessor
        this.sheetIdentifier = sheetIdentifier
        this.store = store
    }

    private processGuides = (sheet: WorkSheet, guide: EnhancedSheetGuide) => {
        // when the excel value of the date column is not a date - but a string - we need to provide a converstion function.
        const dateConversionFunction = (d: string): moment.Moment => {
            return moment.utc(d, guide.dateFormat || undefined)
        }
        
        for (let row = guide.startRow + 1 ; row < guide.endRow ; row ++) {
            // get dates from excel
            const date = this.excelProcessor.cellDateValue(sheet, row, guide.date, dateConversionFunction)
            const billDate = this.excelProcessor.cellDateValue(sheet, row, guide.billDate, dateConversionFunction)

            // based on data and billDate - calculate timestamp
            const timestamp = moment(billDate)
            if (!timestamp.isSame(date) && guide.accountType === AccountType.CreditCard) {
                if (timestamp.month() !== date.month()) timestamp.subtract(1, 'month')
                timestamp.date(date.date())
            }
            const entry: RawTransaction = {
                amount: this.excelProcessor.cellCurrencyValue(sheet, row, guide.amount) * (guide.accountType === AccountType.CreditCard ? -1 : 1),
                description: this.excelProcessor.cellValue(sheet, row, guide.description),
                date: date.valueOf(),
                billDate: billDate.valueOf(),
                origin: guide.name,
                accountType: guide.accountType,
                timestamp: timestamp.valueOf(),
                month: (timestamp.month() + 1).toString(),
                type: TransactionType.Expense, // TODO
            }

            if (entry.amount === 0) continue;
            
            entry.type = entry.amount && entry.amount > 0 ? TransactionType.Income : TransactionType.Expense
            
            if (typeof entry.amount !== 'number' || typeof entry.description !== 'string') {
                console.error('Error entry', entry)
                continue
            }
            if (!entry.timestamp) {
                console.error('Error - Finished with entry column parsing and have no timestamp!', entry, row, guide)
                throw new Error('Error - Finished with entry column parsing and have no timestamp!')
            }

            // Add transaction effective month.
            // if (guide.monthGetter) entry.month = guide.monthGetter(entry.timestamp, 'YYYY-MM')
            // else entry.month = moment.unix(entry.timestamp / 1000).format('YYYY-MM')

            this.store.addTransaction(entry)
        }
    }

    private process = (sheet: WorkSheet) => {
        const guide = this.sheetIdentifier.identify(sheet)
        if (guide) {
            console.log('Found matching sheet for identifier', guide.name)
            this.processGuides(sheet, guide)
        }
    }

    public run = async (path: string) => {
        console.log('processing', path);
        (await this.excelProcessor.loadFolder(path)).forEach((w) => {
            Object.values(w.Sheets).forEach((s) => this.process(s))
        })
    }
}