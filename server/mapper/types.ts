import { RawTransaction } from "../fetcher/types"

export interface IMapper {
    getMappings: () => Mapping[][]
    setMappings: (mappings: Mapping[][]) => void
    getCategory: (t: RawTransaction, categoryIndex: number) => string
    addMapping: (mapping: Mapping, categoryIndex: number) => void
}

export type Mapping = {
    categoryName: string
    regex: string
}
