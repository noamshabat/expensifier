import 'reflect-metadata'
import { inject, injectable } from "inversify";
import { ALL_FACETS, FiltersDesc, IAPI, Mapping } from "../shared.types";
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

    getTransactions(p:{ filters: FiltersDesc, from?: number, to?: number }) {
        const allTransactions = this.store.getTransactions(p.filters)
		const from = p.from || 0
        const to = p.to || allTransactions.length
        return Promise.resolve({ transactions: allTransactions.slice(from, to), totalCount: allTransactions.length })
    }

    getMappings() {
        return Promise.resolve(this.mapper.getMappings())
    }

    getFacets(p: { filters: FiltersDesc }) {
        return Promise.resolve(this.store.getDistinctFacetValues(ALL_FACETS, p.filters))
    }

    addMapping(p: { mapping: Mapping, categoryIndex: number }) {
        this.mapper.addMapping(p.mapping, p.categoryIndex)
        this.store.reProcessTransactions()
        return Promise.resolve()
    }

    async addFiles(p: { files: FileList }) {
        await this.runner.run(Array.from(p.files) as unknown as { name: string }[])
		return Promise.resolve({ processed: 0 }) 
    }
}