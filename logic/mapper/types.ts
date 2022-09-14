import { Mapping, RawTransaction } from "../shared.types"

export interface IMapper {
    getMappings: () => Mapping[][]
    setMappings: (mappings: Mapping[][]) => Promise<void>
    getCategory: (t: RawTransaction, categoryIndex: number) => string
    addMapping: (mapping: Mapping, categoryIndex: number) => void
}
