import React, { useContext, useMemo, useState } from "react"
import { Transaction } from "../shared.types"

export type FiltersDesc = { [key in keyof Partial<Transaction>]: unknown[] }
type FiltersContext = {
    filters: FiltersDesc
    setFilters: (desc: FiltersDesc) => void
}

const Context = React.createContext({ filters: {}, setFilters: () => { null }} as FiltersContext)

export const FiltersContext: React.FC<React.PropsWithChildren<unknown>> = (props) => {
    const [filters, setFiltersState] = useState<FiltersDesc>({category: [], month: [], type: [], origin: []})
    
    const contextValue = useMemo(() => ({
        filters, 
        setFilters: (desc: FiltersDesc) => setFiltersState({...filters, ...desc}),
    }), [filters])

    return <Context.Provider value={contextValue}>{props.children}</Context.Provider>
}

export function useFilters() { return useContext(Context) }