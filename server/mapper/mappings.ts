import { injectable } from 'inversify'
import {readFileSync, writeFileSync} from "fs"
import { IMapper, Mapping } from "./types"

@injectable()
export class Mapper implements IMapper {
    getMappings() {
        const mappings = readFileSync(`${__dirname}/data/mappings.json`).toString()
        return JSON.parse(mappings)
    }
    
    setMappings(data: Mapping[]) {
        writeFileSync(`${__dirname}/data/mappings.json`, JSON.stringify(data,null,'\t'))
    }
}
