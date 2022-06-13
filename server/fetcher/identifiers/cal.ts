import moment from "moment"
import { IRunner } from "../runner/type"
import { DataGuide, SheetIdentifier } from "./type"

const CAL_CREDIT_CARD = 'CAL Credit Card'

const CalCreditCardIdentifier: SheetIdentifier = {
    name: CAL_CREDIT_CARD,
    cells: [{
        row: 3,
        column: 1,
        value: 'תאריך העסקה'
    }, {
        row: 3,
        column: 2,
        value: 'שם בית העסק'
    }, {
        row: 3,
        column: 4,
        value: 'סכום החיוב'
    }]
}

const CalCreditCardDatumGuides: DataGuide = {
    name: CAL_CREDIT_CARD,
    startRow: 4,
    columns: [
        { name: 'date', number: 1, func: (val) => moment(val, 'DD/MM/YY').format('DD/MM/YYYY') },
        { name: 'description', number: 2, filters: [], },
        { name: 'amount', number: 4, func: (val) => {
            if (typeof val === 'string') {
                let ret = val
                if (ret.includes(' ')) ret = ret.split(' ')[1]
                return parseFloat(ret.replace(',', '')) * -1
            }
            else return val * -1
        }}
    ],
    endRow: { column: 1, value: 'סה"כ:'},
}

export function RegisterCalCreditCard(runner: IRunner) {
    runner.registerIdentifier(CalCreditCardIdentifier, CalCreditCardDatumGuides)
}