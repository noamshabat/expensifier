import { FacetKeys, Facets, RawTransaction, Transaction } from "../shared.types";

export type FiltersDesc = { [key in keyof Partial<Transaction>]: unknown[] }

export interface IStore {
    addTransaction: (t: RawTransaction) => void
    getTransactions: (filters: FiltersDesc) => Transaction[]
    getDistinctFacetValues: (req: FacetKeys[], filters: FiltersDesc) => Facets
    reProcessTransactions: () => void
}
