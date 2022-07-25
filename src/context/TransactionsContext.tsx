import React, { useContext, useEffect, useState } from "react"
import * as API from "../api"
import { useFilters } from "./FiltersContext"
import { Transaction } from "../types"

interface TransactionsContextProps {
    transactions: Transaction[]
    fetchTransactions: () => void
}

const Context = React.createContext({} as TransactionsContextProps)

export const TransactionsContext: React.FC<React.PropsWithChildren<unknown>> = (props) => {
    const { filters } = useFilters()
    const [transactions, setTransactions] = useState<Transaction[]>([])

    const fetch = () => void API.getTransactions(filters).then(setTransactions) 
    useEffect(() => fetch(), [filters])

    return <Context.Provider value={{
        fetchTransactions: fetch,
        transactions
    }}>
        {props.children}
    </Context.Provider>  
}

export function useTransactions() {
    return useContext(Context)
}
