import moment from "moment"
import { IRunner } from "../runner/types"
import { DataGuide, SheetIdentifier } from "./types"

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
        { name: 'timestamp', number: 1, valueGetter: (val) => moment(val, 'DD/MM/YY').valueOf() },
        { name: 'description', number: 2 },
        { name: 'amount', number: 4, valueGetter: (val) => {
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