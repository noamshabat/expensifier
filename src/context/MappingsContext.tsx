import React, { useContext } from "react"
import { Mapping } from "../types"
import * as API from '../api'
import { useTransactions } from "./TransactionsContext"
import { useFacets } from "./FacetsContext"

// we need an initial context for the type engine
const initialContext = { setMapping: (_mapping: Mapping) => { null } }
const Context = React.createContext(initialContext)

export const MappingsContext: React.FC<React.PropsWithChildren<unknown>> = (props) => {
    const { fetchTransactions } = useTransactions()
    const { fetchFacets } = useFacets()

    return <Context.Provider value={{ 
        setMapping: (mapping: Mapping) => {
            API.addMapping(mapping).then(() => {
                fetchTransactions()
                fetchFacets()
            })
        }
    }}>
        {props.children}
    </Context.Provider> 
}

export function useMappings() {
    return useContext(Context)
}