import {readFileSync, writeFileSync} from "fs"

export function getMappings() {
    const mappings = readFileSync(`${__dirname}/data/mappings.json`).toString()
    return JSON.parse(mappings)
}

export function setMappings(data: any) {
    writeFileSync(`${__dirname}/data/mappings.json`, JSON.stringify(data,null,'\t'))
}