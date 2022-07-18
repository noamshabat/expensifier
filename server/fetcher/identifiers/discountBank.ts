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
        { name: 'timestamp', number: 1, valueGetter: (val) => moment(val, 'MM/DD/YYYY').valueOf() },
        { name: 'description', number: 3 },
        { name: 'amount', number: 4, valueGetter: (val: string) => parseFloat(val.replace(',','')) },
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
        { name: 'timestamp', number: 8 , valueGetter: (val) => moment(val, 'DD/MM/YYYY').valueOf() },
        { name: 'description', number: 2 },
        { name: 'amount', number: 9, valueGetter: (val) => val * -1 },
    ],
    endRow: { column: 2, value: '' },
    monthGetter: (timestamp: number, format: string) => {
        console.log('timestamp', timestamp)
        console.log('moment.unix', moment.unix(timestamp).toISOString())
        return moment.unix(timestamp / 1000).subtract(1, 'month').format(format)
    }
}

export function RegisterDiscountBankCheckingAccount(runner: IRunner) {
    runner.registerIdentifier(DBCheckingAccountIdentifier, DBCheckingAccountDatumGuides)
    runner.registerIdentifier(DBCreditCardIdentifier, DBCreditCardDataGuide)
}