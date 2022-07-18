export enum TransactionType {
    Expense='Expense',
    Income='Income',
}

export type Transaction = {
    description: string
    date: number
    amount: number
    origin: string
    category?: string
    month: string
    type: TransactionType
}

export type Mapping = {
    categoryName: string
    regex: string
}

export const enum Views {
    List='List',
    Bar='Bar',
    CategoryPie='Category Pie'
}
  
  
export const UNDEFINED_CATEGORY = 'N/A'

export type Filterable = string|number
