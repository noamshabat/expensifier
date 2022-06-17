import { ITransaction } from "../fetcher/types"

const store = {
    transactions: []
} as {
    transactions: ITransaction[]
}

const api = {
    addTransaction: (t: ITransaction) => {
        store.transactions.push(t)
    },
    allRecords: () => store.transactions
}

export default api