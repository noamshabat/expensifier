import 'reflect-metadata'
import { inject, injectable } from "inversify"
import { IRawTransaction, ITransaction } from "../fetcher/types"
import { FacetKeys, Facets, IStore } from "./types"
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
	
	public addTransaction(t: IRawTransaction) { this._store.transactions.push(this.processTransaction(t)) }
	public getAll = () => this._store.transactions

	public getDistinctFacetValues(req: FacetKeys[]) : Facets {
		// initialize facets
		const facets = req.reduce<Facets>((currFacets, key) => {
			currFacets[key] = []
			return currFacets
		}, {})
		// build the facet array
		return this._store.transactions.reduce<Facets>((currFacets, t) => {
			req.forEach((key) => !currFacets[key]?.includes(t[key]) && (currFacets[key]?.push(t[key])) )
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
