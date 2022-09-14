import 'reflect-metadata'
import { inject, injectable } from 'inversify'
import { IMapper } from "./types"
import { Mapping, RawTransaction, UNDEFINED_CATEGORY } from '../shared.types'
import { AppFiles, IFileManager } from '../fs/fileManager.types'
import { LOGIC_TYPES } from '../types'

@injectable()
export class Mapper implements IMapper {
    private fileMgr: IFileManager
    private mappings: Mapping[][] = [[], [], [], []]

    constructor(
        @inject(LOGIC_TYPES.IFileManager) fileMgr: IFileManager
    ) {
        this.fileMgr = fileMgr
        this.loadMappings()
    }

    async loadMappings() {
        this.mappings = await this.fileMgr.fileAsJson<Mapping[][]>(AppFiles.Mappings)
    }

    getMappings() {
        return this.mappings
    }
    
    setMappings(data: Mapping[][]): Promise<void> {
        return this.fileMgr.writeJsonToFile(AppFiles.Mappings, data)
    }

    addMapping(mapping: Mapping, categoryIndex: number) {
        this.mappings[categoryIndex].push(mapping)
        this.setMappings(this.mappings)
    }

    getCategory(t: RawTransaction, categoryIndex: number) {
        const matches = this.mappings[categoryIndex].filter((m) => t.description.match(m.regex))
        if (matches && matches.length) {
            if (matches.length > 1) {
                console.error('Found multiple matches for record', matches, t)
            }
            return matches[0].categoryName
            
        } else {
            return UNDEFINED_CATEGORY
        }
    }
}
