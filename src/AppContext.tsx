import Button from "@mui/material/Button"
import moment from "moment"
import React, { useContext, useEffect, useState } from "react"
import * as API from "./api"
import { Mapping, Transaction, TransactionType, UNDEFINED_CATEGORY, Views } from "./types"

type FiltersDesc = { [key in keyof Partial<Transaction>]: any[] }

interface AppContextProps {
    transactions: Transaction[]
    mappings: Mapping[]
    categoryNames: string[]
    monthNames: string[]
    originNames: string[]
    filteredMonths: string[]
    filteredCategories: string[]
    typeNames: string[]
    filters: FiltersDesc,
    view: Views,
    setMappings: (mappings: any[]) => void
    setFilters: (desc: FiltersDesc) => void
    setView: (view: Views) => void
}

let _setMappings = (mappings: any[]) => {}
let _setFilters = (desc: FiltersDesc) => {}
let _setView = (view: Views) => {}

const initialContext: AppContextProps = {
    transactions: [],
    mappings: [],
    categoryNames: [],
    monthNames: [],
    originNames: [],
    typeNames: [TransactionType.Expense, TransactionType.Income],
    filteredMonths: [],
    filteredCategories: [],
    filters: {},
    view: Views.List,
    setView: (view: Views) : void => { _setView(view) },
    setMappings: (mappings: any[]): void => { _setMappings(mappings) },
    setFilters: (desc: FiltersDesc): void => { _setFilters(desc) },
}

const Context = React.createContext(initialContext)

export const AppContext: React.FC<React.PropsWithChildren<{}>> = (props) => {
    const [originalTransactions, setOriginalTransactions] = useState<Transaction[]>([])
    const [contextValue, setContextValueInner] = useState(initialContext)
    const [contextHistory, setContextHistory] = useState<AppContextProps[]>([initialContext])

    function setContextValue(contextIn: AppContextProps) {
        setContextValueInner(contextIn)
        setContextHistory([...contextHistory, contextIn])
    }

    useEffect(() => {
        console.log('mounting context')
        Promise.all([API.getTransactions(), API.getMappings()]).then(([transactions, mappings]) => {
            setOriginalTransactions(transactions)

            const months: string[] = []
            const origins: string[] = []

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
                let month = moment(t.date, 'DD/MM/YYYY').format('YYYY-MM')
                if (t.origin.includes('Discount Bank Credit Card')) month = moment(t.date).subtract(1, 'month').format('YYYY-MM')
                if (!months.includes(month)) months.push(month)
                t.month = month
                if (!origins.includes(t.origin)) origins.push(t.origin)

                // get month end
                return t
            })
            const categories = Array.from(new Set(mappings.map((m) => m.categoryName)));
            categories.push(UNDEFINED_CATEGORY)
            
            setContextValue({
                ...initialContext,
                transactions: withCategories, 
                mappings, 
                categoryNames: categories,
                monthNames: months,
                originNames: origins,
                filteredMonths: months,
                filteredCategories: categories,
                filters: initialContext.filters,
                setMappings: initialContext.setMappings,
                setFilters: initialContext.setFilters
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
            const monthNames = Array.from(new Set(newTransactions.map((t) => t.month)))
            const categoryNames = Array.from(new Set(newTransactions.map((t) => t.category || 'undefined')))
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
