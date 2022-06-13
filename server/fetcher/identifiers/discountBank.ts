import moment from 'moment';
import { DataGuide, SheetIdentifier } from '../identifiers/type';
import { IRunner } from '../runner/type';

const CHECKING_ACCOUNT = 'Discount Bank Checking Account'
const CREDIT_CARD = 'Discount Bank Credit Card'

const DBCheckingAccountIdentifier: SheetIdentifier = {
    name: CHECKING_ACCOUNT,
    cells: [{
        row: 1,
        column: 1,
        value: 'עובר ושב'
    }]
}

const DBCheckingAccountDatumGuides: DataGuide = {
    name: CHECKING_ACCOUNT,
    startRow: 10,
    columns: [
        { name: 'date', number: 1, func: (val) => moment(val, 'MM/DD/YYYY').format('DD/MM/YYYY') },
        { name: 'description', number: 3, filters: [] },
        { name: 'amount', number: 4, func: (val: string) => parseFloat(val.replace(',','')) },
    ],
    endRow: { column: 1, value: '' }
}

const DBCreditCardIdentifier: SheetIdentifier = {
    name: CREDIT_CARD,
    cells: [
        { row: 1, column: 1, value: 'כרטיסי אשראי' },
        { row: 13, column: 2, value: 'בית עסק' },
        { row: 13, column: 8, value: 'תאריך החיוב' },
    ]
}

const DBCreditCardDataGuide: DataGuide = {
    name: CREDIT_CARD,
    startRow: 14,
    columns: [
        { name: 'date', number: 8 , func: (val) => moment(val, 'DD/MM/YYYY').format('DD/MM/YYYY') },
        { name: 'description', number: 2, filters: [], },
        { name: 'amount', number: 9, func: (val) => val * -1 },
    ],
    endRow: { column: 2, value: '' }
}

export function RegisterDiscountBankCheckingAccount(runner: IRunner) {
    runner.registerIdentifier(DBCheckingAccountIdentifier, DBCheckingAccountDatumGuides)
    runner.registerIdentifier(DBCreditCardIdentifier, DBCreditCardDataGuide)
}