
export type Mapping = {
    categoryName: string
    regex: string
}

export enum TransactionOrigin {
    DiscountBankCreditCard='DiscountBankCreditCard',
    DiscountBankChecking='DiscountBankChecking',
}

export enum TransactionType {
    Expense='Expense',
    Income='Income',
}

export type Transaction = {
    timestamp: number
    description: string
    date: number
    amount: number
    origin: TransactionOrigin
    category: string
    category2: string
    category3: string
    category4: string
    month: string
    type: TransactionType
}

export type CategoryKeys = 'category' | 'category2' | 'category3' | 'category4'
export type FacetKeys = CategoryKeys | 'month' | 'origin' | 'type'
export const ALL_CATEGORIES: CategoryKeys[] = ['category', 'category2', 'category3', 'category4']
export const ALL_FACETS: FacetKeys[] = [...ALL_CATEGORIES, 'month', 'origin', 'type']
export const UNDEFINED_CATEGORY = 'N/A'