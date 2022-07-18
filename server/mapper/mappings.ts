import 'reflect-metadata'
import { injectable } from 'inversify'
import {readFileSync, writeFileSync} from "fs"
import { IMapper, Mapping, UNDEFINED_CATEGORY } from "./types"
import { IRawTransaction } from '../fetcher/types'

@injectable()
export class Mapper implements IMapper {
    private mappings: Mapping[] = []
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
    
    setMappings(data: Mapping[]) {
        writeFileSync(`${__dirname}/data/mappings.json`, JSON.stringify(data,null,'\t'))
    }

    addMapping(mapping: Mapping) {
        this.mappings.push(mapping)
        this.setMappings(this.mappings)
    }

    getCategory(t: IRawTransaction) {
        const matches = this.mappings.filter((m) => t.description.match(m.regex))
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
