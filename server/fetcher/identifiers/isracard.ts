import moment from "moment"
import { IRunner } from "../runner/type"
import { DataGuide, SheetIdentifier } from "./type"

const ISRACARD_CREDIT_CARD = 'IsraCard Credit Card'

const IsracardCreditCardIdentifier: SheetIdentifier = {
    name: ISRACARD_CREDIT_CARD,
    cells: [{
        row: 4,
        column: 2,
        value: 'מועד חיוב'
    }, {
        row: 6,
        column: 1,
        value: 'תאריך רכישה'
    }, {
        row: 6,
        column: 2,
        value: 'שם בית עסק'
    },{
        row: 6,
        column: 5,
        value: 'סכום חיוב'
    }]
}

const IsracardCreditCardDatumGuides: DataGuide = {
    name: ISRACARD_CREDIT_CARD,
    startRow: 7,
    columns: [
        { name: 'timestamp', number: 1, valueGetter: (val) => moment(val, 'DD/MM/YYYY').valueOf() },
        { name: 'description', number: 2 },
        { name: 'amount', number: 5, valueGetter: (val) => val * -1},
    ],
    endRow: { column: 2, value: 'סך חיוב בש"ח:' },
}

export function RegisterIsracardCreditCard(runner: IRunner) {
    runner.registerIdentifier(IsracardCreditCardIdentifier, IsracardCreditCardDatumGuides)
}