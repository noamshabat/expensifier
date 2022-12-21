import 'reflect-metadata'
import { inject, injectable } from "inversify";
import { ALL_FACETS, AppFiles, FiltersDesc, IAPI, Mapping, UploadedFiles } from "../shared.types";
import { IStore } from "../store/store.types";
import { IRunner } from '../fetcher/runner/types';
import { IMapper } from '../mapper/types';
import { LOGIC_TYPES } from '../types';
import { IFileManager } from '../fs/fileManager.types';

@injectable()
export class Integration implements IAPI {
    private store: IStore
    private mapper: IMapper
	private runner: IRunner
	private fileMgr: IFileManager
	
    constructor(
        @inject(LOGIC_TYPES.IMapper) mapper: IMapper,
		@inject(LOGIC_TYPES.IStore) store: IStore,
		@inject(LOGIC_TYPES.IRunner) runner: IRunner,
		@inject(LOGIC_TYPES.IFileManager) fileMgr: IFileManager,
    ) {
        this.store = store
        this.mapper = mapper
        this.runner = runner
		this.fileMgr = fileMgr
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

    async addFiles(p: { files: UploadedFiles }) {
        await this.runner.run(p.files)
		return Promise.resolve({ processed: 0 }) 
    }

	async getConfigFile (p: { file: AppFiles; }) {
		return this.fileMgr.fileAsJson(p.file) as Promise<object>
	}

	async setConfigFile (p: { file: AppFiles, data: unknown }) {
		return this.fileMgr.writeJsonToFile(p.file, p.data)
	}
}
