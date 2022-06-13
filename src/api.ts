import _env from "./_env";
import { Mapping, Transaction } from './types'

const enum APIs {
    Transactions='transactions',
    Mappings='mappings'
}

function path(api: APIs) {
    return `${_env.ServerUrl}${api}`
}

export async function getTransactions() {
    const response = await fetch(path(APIs.Transactions), {
        method: 'GET'
    })
    return response.json() as Promise<Transaction[]>
}

export async function getMappings() {
    const response = await fetch(path(APIs.Mappings), {
        method: 'GET'
    })
    return response.json() as Promise<Mapping[]> 
}

export async function setMappings(mappings: any[]) {
    await fetch(path(APIs.Mappings), {
        method: 'POST',
        headers: [
            ['Content-Type', 'application/json'],
        ],
        body: JSON.stringify({ mappings }),
    })
}
