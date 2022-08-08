import 'reflect-metadata'
import { injectable } from 'inversify'
import {readFileSync, writeFileSync} from "fs"
import { IMapper, Mapping } from "./types"
import { RawTransaction } from '../fetcher/types'
import { UNDEFINED_CATEGORY } from '../shared.types'

@injectable()
export class Mapper implements IMapper {
    private mappings: Mapping[][] = [[], [], [], []]
    constructor() {
        this.loadMappings()
    }

    loadMappings() {
        const fileContents = readFileSync(`${__dirname}/data/mappings.json`).toString()
        this.mappings = JSON.parse(fileContents)
    }

    getMappings() {
        return this.mappings
    }
    
    setMappings(data: Mapping[][]) {
        writeFileSync(`${__dirname}/data/mappings.json`, JSON.stringify(data,null,'\t'))
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
