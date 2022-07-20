import _env from "./_env";
import { Mapping, Transaction } from './types'
import { Facets } from "./context/FacetsContext";
import { FiltersDesc } from "./context/FiltersContext";

const enum APIs {
    Transactions='transactions',
    Mappings='mappings',
    Facets='facets',
}

const enum Methods {
    Get='GET',
    Post='POST'
}

// automatically call the toString() method on all properties of an object.
function stringifyParams(params: { [key:string]: unknown }) {
    return Object.entries(params).reduce((stringifiedParams, [k, v]) => {
        stringifiedParams[k as keyof typeof stringifiedParams] = JSON.stringify(v)
        return stringifiedParams
    }, {} as { [key:string] : string})
}

async function runFetch(api: APIs, method: Methods, params?: { [key:string]: unknown }, body?: object) {
    const url = params ? `${path(api)}?${new URLSearchParams(stringifyParams(params))}` : path(api)
    return fetch(url, {
        method,
        headers: [['Content-Type', 'application/json']],
        body: (body && JSON.stringify(body) || undefined),
    })
}
function path(api: APIs) {
    return `${_env.ServerUrl}${api}`
}

export async function getTransactions(filters: FiltersDesc) {
    const response = await runFetch(APIs.Transactions, Methods.Get, { filters })
    return response.json() as Promise<Transaction[]>
}

export async function getMappings() {
    const response = await runFetch(APIs.Mappings, Methods.Get)
    return response.json() as Promise<Mapping[]> 
}

export async function addMapping(mapping: Mapping) {
    await runFetch(APIs.Mappings, Methods.Post, undefined, mapping)
}

export async function getFacets(filters: FiltersDesc) {
    const response = await runFetch(APIs.Facets, Methods.Get, { filters })
    return response.json() as Promise<Facets>
}