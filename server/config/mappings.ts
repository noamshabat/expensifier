import {readFileSync, writeFileSync} from "fs"
import { Mapping } from "../fetcher/types"

export function getMappings() {
    const mappings = readFileSync(`${__dirname}/data/mappings.json`).toString()
    return JSON.parse(mappings)
}

export function setMappings(data: Mapping[]) {
    writeFileSync(`${__dirname}/data/mappings.json`, JSON.stringify(data,null,'\t'))
}
