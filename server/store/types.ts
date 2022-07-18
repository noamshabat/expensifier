import { IRawTransaction, ITransaction } from "../fetcher/types";

export type FacetKeys = 'category' | 'month' | 'origin' | 'type'
export type Facets = { [key in FacetKeys]?: string[] }

export const ALL_FACETS: FacetKeys[] = ['category','month','origin','type']

export interface IStore {
    addTransaction: (t: IRawTransaction) => void
    getAll: () => ITransaction[]
    getDistinctFacetValues: (req: FacetKeys[]) => Facets
    reProcessTransactions: () => void
}
