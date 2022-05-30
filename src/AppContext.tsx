import React, { useContext, useEffect, useState } from "react"
import * as API from "./api"
import { Mapping, Transaction, UNDEFINED_CATEGORY } from "./types"

type FiltersDesc = { [key in keyof Partial<Transaction>]: any[] }

interface AppContextProps {
    transactions: Transaction[]
    mappings: Mapping[]
    categoryNames: string[]
    monthNames: number[]
    filters: FiltersDesc, 
    setMappings: (mappings: any[]) => void
    setFilters: (desc: FiltersDesc) => void
}

let _setMappings = (mappings: any[]) => {}
let _setFilters = (desc: FiltersDesc) => {}

const initialContext: AppContextProps = {
    transactions: [],
    mappings: [],
    categoryNames: [],
    monthNames: [],
    filters: {},
    setMappings: (mappings: any[]): void => { _setMappings(mappings) },
    setFilters: (desc: FiltersDesc): void => { _setFilters(desc) },
}

const Context = React.createContext(initialContext)

export const AppContext: React.FC<React.PropsWithChildren<{}>> = (props) => {
    const [originalTransactions, setOriginalTransactions] = useState<Transaction[]>([])
    const [contextValue, setContextValue] = useState(initialContext)
    
    useEffect(() => {
        console.log('mounting context')
        Promise.all([API.getTransactions(), API.getMappings()]).then(([transactions, mappings]) => {
            setOriginalTransactions(transactions)

            const months: number[] = []

            const withCategories = transactions.map((t) => {
                const matches = mappings.filter((m) => t.description.match(m.regex))
                if (matches && matches.length) {
                    t.category = matches[0].categoryName
                    if (matches.length > 1) {
                        console.error('Found multiple matches for record', matches, t)
                    }
                } else {
                    t.category = UNDEFINED_CATEGORY
                }

                // get month
                t.month = new Date(t.date).getMonth() + 1 // avoid zero based for readability
                if (!months.includes(t.month)) months.push(t.month)
                if (t.origin.includes('Credit Card')) t.month -= 1
                // get month end
                return t
            })
            const categories = Array.from(new Set(mappings.map((m) => m.categoryName)));
            categories.push(UNDEFINED_CATEGORY)
            
            setContextValue({
                transactions: withCategories, 
                mappings, 
                categoryNames: categories,
                monthNames: months,
                filters: contextValue.filters,
                setMappings: contextValue.setMappings,
                setFilters: contextValue.setFilters
            })
        })
        return () => console.log('unmounting context')
    }, [])

    useEffect(() => {
        _setMappings = (mappings: any[]) => {
            setContextValue({
                ...contextValue,
                mappings
            })
            API.setMappings(mappings)
        }

        _setFilters = (desc: FiltersDesc) => {
            const newFilters = { ...contextValue.filters, ...desc }
            let newTransactions = [...originalTransactions]
            Object.entries(newFilters).forEach(([filter, values]) => {
                newTransactions = newTransactions.filter((t) => !values || values.length === 0 || values.includes(t[filter as keyof Transaction]))
            })
            setContextValue({
                ...contextValue,
                transactions: newTransactions,
                filters: newFilters,
            })
        }
    }, [contextValue])

    return <Context.Provider value={contextValue}>{props.children}</Context.Provider>  
}

export function useAppContext() {
    return useContext(Context)
}
