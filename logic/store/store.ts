import 'reflect-metadata'
import { inject, injectable } from "inversify"
import { FiltersDesc, IStore } from "./store.types"
import { IMapper } from '../mapper/types'
import { LOGIC_TYPES } from '../types'
import { FacetKeys, Facets, RawTransaction, Transaction } from '../shared.types'

type IStoreContents = { transactions: Transaction[] } 

@injectable()
export class Store implements IStore {
	private mapper: IMapper
	constructor(
		@inject(LOGIC_TYPES.IMapper) mapper: IMapper,
	) {
		this.mapper = mapper;
	}

	private _store: IStoreContents = { transactions: [] }
	private _filterCache: { [key: string]: IStoreContents } = {}
	
	public addTransaction(t: RawTransaction) { this._store.transactions.push(this.processTransaction(t)) }
	public getTransactions = (filters: FiltersDesc) => {
		const filterString = JSON.stringify(filters)
		
		// if we're cached return the cache.
		if (this._filterCache[filterString]) return this._filterCache[filterString].transactions

		// not cached - filter and cache.
		this._filterCache[filterString] = { transactions: [] }
		this._store.transactions.forEach((t) => this.filterTransaction(t, filters) && this._filterCache[filterString].transactions.push(t))
		return this._filterCache[filterString].transactions
	}

	private filterTransaction(t: Transaction, filters: FiltersDesc): boolean {
		for ( const key of Object.keys(filters)) {
			const filter = filters[key as keyof FiltersDesc]
			if (key === 'description' && filter && filter.length && t.description.toLowerCase().includes((filter[0] as string).toLowerCase())) continue
			if (filter && filter.length && !filter.includes(t[key as keyof Transaction])) return false
		}
		return true
	}

	public getDistinctFacetValues(req: FacetKeys[], filters: FiltersDesc) : Facets {
		// initialize facets
		const facets = req.reduce<Facets>((currFacets, key) => {
			currFacets[key] = []
			return currFacets
		}, {} as Facets)
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
		this._filterCache = {}
	}

	private processTransaction(t: RawTransaction): Transaction {
		this._filterCache = {}
		return {
			...t,
			category: this.mapper.getCategory(t, 0),
			category2: this.mapper.getCategory(t, 1),
			category3: this.mapper.getCategory(t, 2),
			category4: this.mapper.getCategory(t, 3),
		}
	}
}
