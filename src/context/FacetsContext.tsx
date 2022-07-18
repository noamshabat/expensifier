import React, { useContext, useEffect, useState } from "react"
import * as API from "../api"

export type Facets = {
    category: string[]
    month: string[]
    origin: string[]
    type: string[]
}

type FacetsContext = {
    facets: Facets
    fetch: () => void
}

const initialContext: FacetsContext = {
    facets: {
        category: [],
        month: [],
        origin: [],
        type: [],
    },
    fetch: () => { null }
}

const Context = React.createContext(initialContext)

export const FacetsContext: React.FC<React.PropsWithChildren<unknown>> = (props) => {
    const [facets, setFacets] = useState(initialContext.facets)
    const fetch = () => API.getFacets().then(setFacets)
    useEffect(() => { fetch() }, [])

    return <Context.Provider 
        value={{
            facets,
            fetch,
        }}
    >
        {props.children}
    </Context.Provider>
}

export function useFacets() {
    return useContext(Context)
}
