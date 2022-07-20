import Button from "@mui/material/Button"
import React, { useContext, useEffect, useState } from "react"
import * as API from "./api"
import { useFilters } from "./context/FiltersContext"
import { Transaction } from "./types"

interface AppContextProps {
    transactions: Transaction[]
    fetchTransactions: () => void
}

let _fetchTransactions = () => { null }

const initialContext: AppContextProps = {
    transactions: [],
    fetchTransactions: (): void => _fetchTransactions(),
}

const Context = React.createContext(initialContext)

export const AppContext: React.FC<React.PropsWithChildren<unknown>> = (props) => {
    const { filters } = useFilters()

    const [originalTransactions, setOriginalTransactions] = useState<Transaction[]>([])
    const [contextValue, setContextValueInner] = useState(initialContext)
    const [contextHistory, setContextHistory] = useState<AppContextProps[]>([initialContext])

    function setContextValue(contextIn: AppContextProps) {
        setContextValueInner(contextIn)
        setContextHistory([...contextHistory, contextIn])
    }

    useEffect(() => {
        console.log('mounting context')
        Promise.all([API.getTransactions(filters)]).then(([transactions]) => {
            setOriginalTransactions(transactions)
            setContextValue({
                ...initialContext,
                transactions, 
            })
        })
        return () => console.log('unmounting context')
    }, [])

    useEffect(() => {
        API.getTransactions(filters).then((transactions) => setContextValue({ ...contextValue, transactions }))
    }, [filters])

    useEffect(() => {
        _fetchTransactions = () => {
            API.getTransactions(filters).then((transactions) => setContextValue({ ...contextValue, transactions }))
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
