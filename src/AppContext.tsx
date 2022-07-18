import Button from "@mui/material/Button"
import React, { useContext, useEffect, useState } from "react"
import * as API from "./api"
import { Transaction, UNDEFINED_CATEGORY, Views } from "./types"

type FiltersDesc = { [key in keyof Partial<Transaction>]: unknown[] }

interface AppContextProps {
    transactions: Transaction[]
    filteredMonths: string[]
    filteredCategories: string[]
    filters: FiltersDesc,
    view: Views,
    setFilters: (desc: FiltersDesc) => void
    setView: (view: Views) => void
    fetchTransactions: () => void
}

let _setFilters = (_desc: FiltersDesc) => { null }
let _setView = (_view: Views) => { null }
let _fetchTransactions = () => { null }

const initialContext: AppContextProps = {
    transactions: [],
    filteredMonths: [],
    filteredCategories: [],
    filters: {},
    view: Views.List,
    setView: (view: Views) : void => { _setView(view) },
    setFilters: (desc: FiltersDesc): void => { _setFilters(desc) },
    fetchTransactions: (): void => _fetchTransactions(),
}

const Context = React.createContext(initialContext)

export const AppContext: React.FC<React.PropsWithChildren<unknown>> = (props) => {
    const [originalTransactions, setOriginalTransactions] = useState<Transaction[]>([])
    const [contextValue, setContextValueInner] = useState(initialContext)
    const [contextHistory, setContextHistory] = useState<AppContextProps[]>([initialContext])

    function setContextValue(contextIn: AppContextProps) {
        setContextValueInner(contextIn)
        setContextHistory([...contextHistory, contextIn])
    }

    useEffect(() => {
        console.log('mounting context')
        Promise.all([API.getTransactions()]).then(([transactions]) => {
            API.getFacets().then((facets) => {
                setOriginalTransactions(transactions)
                setContextValue({
                    ...initialContext,
                    transactions, 
                    filteredMonths: facets.month as string[],
                    filteredCategories: facets.category as string[],
                    filters: initialContext.filters,
                    setFilters: initialContext.setFilters
                })
            })
        })
        return () => console.log('unmounting context')
    }, [])

    useEffect(() => {
        _setFilters = (desc: FiltersDesc) => {
            const newFilters = { ...contextValue.filters, ...desc }
            let newTransactions = [...originalTransactions]
            Object.entries(newFilters).forEach(([filter, values]) => {
                newTransactions = newTransactions.filter((t) => !values || values.length === 0 || values.includes(t[filter as keyof Transaction]))
            })
            const monthNames = Array.from(new Set(newTransactions.map((t) => t.month)))
            const categoryNames = Array.from(new Set(newTransactions.map((t) => t.category || UNDEFINED_CATEGORY)))
            setContextValue({
                ...contextValue,
                transactions: newTransactions,
                filters: newFilters,
                filteredMonths: monthNames,
                filteredCategories: categoryNames,
            })
        }

        _setView = (view: Views) => {
            setContextValue({...contextValue, view})
        }

        _fetchTransactions = () => {
            API.getTransactions().then((transactions) => setContextValue({ ...contextValue, transactions }))
        }
    }, [contextValue, originalTransactions])

    return <Context.Provider value={contextValue}>
        <Button variant="contained" disabled={contextHistory.length === 0} onClick={() => {
            if (contextHistory.length) {
                const oldContext = contextHistory.pop() as AppContextProps
                setContextValueInner(oldContext)
                setContextHistory(contextHistory)
            }
        }}>{'<-- Back'}</Button>

        {props.children}
    </Context.Provider>  
}

export function useAppContext() {
    return useContext(Context)
}
