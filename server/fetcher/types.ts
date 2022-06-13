export enum TransactionType {
    Expense='Expense',
    Income='Income',
}

export enum TransactionOrigins {
    DiscountBankCreditCard='DiscountBankCreditCard',
    DiscountBankChecking='DiscountBankChecking',
}

export interface ITransaction {
    type: TransactionType
    description: string,
    amount: number
    date: Date
    origin: TransactionOrigins
}

export type Mapping = {
    categoryName: string
    regex: string
}

export {}