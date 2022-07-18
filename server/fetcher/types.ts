export enum TransactionType {
    Expense='Expense',
    Income='Income',
}

export enum TransactionOrigin {
    DiscountBankCreditCard='DiscountBankCreditCard',
    DiscountBankChecking='DiscountBankChecking',
}

export interface IRawTransaction {
    type: TransactionType
    description: string
    amount: number
    timestamp: number
    month: string
    origin: TransactionOrigin
}

export interface ITransaction extends IRawTransaction {
    category: string
}

export {}