import { IRawTransaction } from "../fetcher/types"

export interface IMapper {
    getMappings: VoidFunction
    setMappings: (mappings: Mapping[]) => void
    getCategory: (t: IRawTransaction) => string
    addMapping: (mapping: Mapping) => void
}

export type Mapping = {
    categoryName: string
    regex: string
}

export const UNDEFINED_CATEGORY = 'N/A'