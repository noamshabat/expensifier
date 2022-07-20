import { IRawTransaction, ITransaction } from "../fetcher/types";

export type FacetKeys = 'category' | 'month' | 'origin' | 'type'
export type Facets = { [key in FacetKeys]?: string[] }

export type FiltersDesc = { [key in keyof Partial<ITransaction>]: unknown[] }

export const ALL_FACETS: FacetKeys[] = ['category','month','origin','type']

export interface IStore {
    addTransaction: (t: IRawTransaction) => void
    getTransactions: (filters: FiltersDesc) => ITransaction[]
    getDistinctFacetValues: (req: FacetKeys[], filters: FiltersDesc) => Facets
    reProcessTransactions: () => void
}
