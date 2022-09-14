import 'reflect-metadata'
import { unlink, readdir, readFile, writeFile, access } from "fs/promises";
import { inject, injectable } from "inversify";
import { join } from "path";
import { AppFiles, IFileManager } from "../logic/fs/fileManager.types";
import { EnvVar, IEnvironment } from './environment/environment.types';
import { TYPES } from './types';

@injectable()
export class FileManager implements IFileManager {
    private env
    constructor(
        @inject(TYPES.IEnvironment) env: IEnvironment,
    ) {
        this.env = env
    }
    
    private fullPath = (file: AppFiles) => `${this.env.get(EnvVar.DATA_PATH)}/${file}`

    async clearFolder(folder: string): Promise<void> {
        const files = await readdir(folder)

        for (const file of files) {
            await unlink(join(folder, file))
        }
    }

    async fileAsJson<T>(file: AppFiles): Promise<T> {
        return JSON.parse((await readFile(this.fullPath(file))).toString()) as T
    }

    async writeJsonToFile(file: AppFiles, data: unknown): Promise<void> {
        return writeFile(this.fullPath(file), JSON.stringify(data, null, '\t'))
    }

    async exists(file: AppFiles): Promise<boolean> {
        try {
            await access(this.fullPath(file))
            return true
        } catch {
            return false
        }     
    }

    async readdir(path: string): Promise<string[]> {
        return readdir(path)
    }

    async readfile(path: string): Promise<ArrayBuffer> {
        return (await readFile(path)).buffer
    }
}


