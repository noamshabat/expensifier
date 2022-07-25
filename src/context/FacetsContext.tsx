import React, { useContext, useEffect, useState } from "react"
import * as API from "../api"
import { useFilters } from "./FiltersContext"

export type Facets = {
    category: string[]
    month: string[]
    origin: string[]
    type: string[]
}

type FacetsContext = {
    facets: Facets
    filteredFacets: Facets
    fetchFacets: () => void
}

const emptyFacets = {
    category: [],
    month: [],
    origin: [],
    type: [],
} 

const initialContext: FacetsContext = {
    facets: emptyFacets,
    filteredFacets: emptyFacets, 
    fetchFacets: () => { null }
}

const Context = React.createContext(initialContext)

export const FacetsContext: React.FC<React.PropsWithChildren<unknown>> = (props) => {
    const { filters } = useFilters();
    const [facets, setFacets] = useState(initialContext.facets)
    const [filteredFacets, setFilteredFacets] = useState(initialContext.facets)
        
    useEffect(() => { API.getFacets({}).then(setFacets) }, [])
    useEffect(() => { fetch() }, [filters])

    const fetch = () => API.getFacets(filters).then(setFilteredFacets)

    return <Context.Provider 
        value={{
            facets,
            filteredFacets,
            fetchFacets: fetch,
        }}
    >
        {props.children}
    </Context.Provider>
}

export function useFacets() {
    return useContext(Context)
}
