import { AppFiles } from "expensifier-logic/fs/fileManager.types";
import dataColumnOptions from './baseDataColumnOptions.json'
import identifiers from './identifiers.json'
import mappings from './mappings.json'

export const defaultFiles = {
    [AppFiles.DataColumnOptions]: dataColumnOptions,
    [AppFiles.Identifiers]: identifiers,
    [AppFiles.Mappings]: mappings,
}
