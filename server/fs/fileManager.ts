import 'reflect-metadata'
import { unlink, readdir } from "fs/promises";
import { injectable } from "inversify";
import { join } from "path";
import { IFileManager } from "./fileManager.types";

@injectable()
export class FileManager implements IFileManager {
    async clearFolder(folder: string): Promise<void> {
        const files = await readdir(folder)

        for (const file of files) {
            await unlink(join(folder, file))
        }
    }
}
