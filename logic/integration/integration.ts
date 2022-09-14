import 'reflect-metadata'
import { inject, injectable } from "inversify";
import { AddFilesResponse, ALL_FACETS, FiltersDesc, GetFacetsResponse, GetMappingsResponse, GetTransactionsResponse, IAPI, Mapping } from "../shared.types";
import { IStore } from "../store/store.types";
import { IRunner } from '../fetcher/runner/types';
import { IFileManager } from '../fs/fileManager.types';
import { IMapper } from '../mapper/types';
import { LOGIC_TYPES } from '../types';

@injectable()
export class Integration implements IAPI {
    private store: IStore
    private mapper: IMapper
	private runner: IRunner
	private fileManager: IFileManager
	
    constructor(
        @inject(LOGIC_TYPES.IMapper) mapper: IMapper,
		@inject(LOGIC_TYPES.IStore) store: IStore,
		@inject(LOGIC_TYPES.IRunner) runner: IRunner,
		@inject(LOGIC_TYPES.IFileManager) fileManager: IFileManager,
    ) {
        this.store = store
        this.mapper = mapper
        this.runner = runner
        this.fileManager = fileManager
    }

    getTransactions(filters: FiltersDesc, fromIn?: number, toIn?: number): GetTransactionsResponse {
        const allTransactions = this.store.getTransactions(filters)
		const from = fromIn || 0
        const to = toIn || allTransactions.length
        return { transactions: allTransactions.slice(from, to), totalCount: allTransactions.length }
    }

    getMappings() : GetMappingsResponse {
        return this.mapper.getMappings()
    }

    getFacets(filters: FiltersDesc): GetFacetsResponse {
        return this.store.getDistinctFacetValues(ALL_FACETS, filters)
    }

    addMapping(mapping: Mapping, categoryIndex: number) {
        this.mapper.addMapping(mapping, categoryIndex)
        this.store.reProcessTransactions()
    }

    async addFiles(folder: string): AddFilesResponse {
        await this.runner.run(folder)
		await this.fileManager.clearFolder(folder)
		return { processed: 0 } // TODO
    }
}
