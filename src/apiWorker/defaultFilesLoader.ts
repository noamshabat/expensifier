import 'reflect-metadata';
import { LOGIC_TYPES } from "expensifier-logic";
import { IFileManager } from "expensifier-logic/fs/fileManager.types";
import { inject, injectable } from "inversify";
import { defaultFiles } from "./defaultFiles";
import { IDefaultFileLoader } from './fileMgr.types'
import { AppFiles } from 'expensifier-logic/dist/shared.types';

export const DefaultFilesSymbol = Symbol.for("DefaultFilesLoader")

@injectable()
export class DefaultFilesLoader implements IDefaultFileLoader {
    private fileMgr: IFileManager

    constructor(
        @inject(LOGIC_TYPES.IFileManager) fileMgr: IFileManager,
    ) {
        this.fileMgr = fileMgr
    }

    public async verifyDefaultFiles() {
        await this.verifyDefaultFile(AppFiles.DataColumnOptions)
        await this.verifyDefaultFile(AppFiles.Identifiers)
        await this.verifyDefaultFile(AppFiles.Mappings)
    }

    private async verifyDefaultFile(appFile: AppFiles) {
        console.log('checking for default file', appFile)
        if (await this.fileMgr.exists(appFile)) return
        console.log('writing default file', appFile)
        return this.fileMgr.writeJsonToFile(appFile, defaultFiles[appFile])
    }
}