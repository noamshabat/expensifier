import 'reflect-metadata'
import { inject, injectable } from "inversify"
import { IRawTransaction, ITransaction } from "../fetcher/types"
import { FacetKeys, Facets, FiltersDesc, IStore } from "./types"
import { TYPES } from '../types'
import { IMapper } from '../mapper/types'

type IStoreContents = { transactions: ITransaction[] } 

@injectable()
export class Store implements IStore {
	private mapper: IMapper
	constructor(
		@inject(TYPES.IMapper) mapper: IMapper,
	) {
		this.mapper = mapper;
	}

	private _store: IStoreContents = { transactions: [] }
	private _filterCache: { [key: string]: IStoreContents } = {}
	
	public addTransaction(t: IRawTransaction) { this._store.transactions.push(this.processTransaction(t)) }
	public getTransactions = (filters: FiltersDesc) => {
		const filterString = JSON.stringify(filters)
		
		// if we're cached return the cache.
		if (this._filterCache[filterString]) return this._filterCache[filterString].transactions

		// not cached - filter and cache.
		this._filterCache[filterString] = { transactions: [] }
		this._store.transactions.forEach((t) => this.filterTransaction(t, filters) && this._filterCache[filterString].transactions.push(t))
		return this._filterCache[filterString].transactions
	}

	private filterTransaction(t: ITransaction, filters: FiltersDesc): boolean {
		for ( const key of Object.keys(filters)) {
			const filter = filters[key as keyof FiltersDesc]
			if (filter && filter.length && !filter.includes(t[key as keyof ITransaction])) return false
		}
		return true
	}

	public getDistinctFacetValues(req: FacetKeys[], filters: FiltersDesc) : Facets {
		// initialize facets
		const facets = req.reduce<Facets>((currFacets, key) => {
			currFacets[key] = []
			return currFacets
		}, {})
		// build the facet array
		return this._store.transactions.reduce<Facets>((currFacets, t) => {
			if (this.filterTransaction(t, filters))  {
				req.forEach((key) => !currFacets[key]?.includes(t[key]) && (currFacets[key]?.push(t[key])) )
			}
			return currFacets
		}, facets)
	}

	public reProcessTransactions() {
		this._store.transactions.forEach((t, i, a) => { a[i] = this.processTransaction(t)})
	}

	private processTransaction(t: IRawTransaction): ITransaction {
		return {
			...t,
			category: this.mapper.getCategory(t),
		}
	}
}
