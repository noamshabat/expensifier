
export interface IMapper {
    getMappings: VoidFunction
    setMappings: (mappings: Mapping[]) => void
}

export type Mapping = {
    categoryName: string
    regex: string
}