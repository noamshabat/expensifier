import { Transaction } from './shared.types'

export const enum Views {
    List='List',
    Bar='Bar',
}

export type Filterable = string|number

export type TransactionQueryResponse = {
    transactions: Transaction[],
    totalCount: number,
}