
export type Transaction = {
    description: string
    date: number
    amount: number
    origin: string
    category?: string
    month: number
}

export type Mapping = {
    categoryName: string
    regex: string
}

export const UNDEFINED_CATEGORY = 'undefined'

export type Filterable = string|number
