import { useEffect, useState } from "react"
import * as API from "../api"
import { useFilters } from "../context/FiltersContext"
import { useMappings } from "../context/MappingsContext"
import { Transaction } from "../shared.types"
import { TransactionQueryResponse } from "../types"

export function useTransactions(batchSize?: number) {
    const { mappings } = useMappings()
    const { filters } = useFilters()
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)

    const fetch = async (transactionsIn: Transaction[], refetch = false) => {
        // if we already have all transactions - nothing to do
        if (!refetch && transactionsIn.length && transactionsIn.length === total) return

        const from = refetch ? 0 : transactionsIn.length
        const to = batchSize ? (transactionsIn.length + (refetch ? 0 : batchSize)) : undefined

        setLoading(true)
        const res: TransactionQueryResponse = await API.getTransactions(filters, from, to)
        setTotal(res.totalCount)
        setTransactions(refetch ? res.transactions : [...transactionsIn, ...res.transactions]);
        setLoading(false);
    }

    // refresh whenever filters change
    useEffect(() => { fetch([]) }, [filters])
    useEffect(() => { transactions.length && fetch(transactions, true) }, [mappings])

    return {
        transactions,
        fetchNext: () => fetch(transactions),
        refresh: () => fetch([]),
        loading,
        hasMore: transactions.length < total,
    }
}
