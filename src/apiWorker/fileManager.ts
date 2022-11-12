import { AppFiles } from "expensifier-logic/dist/shared.types";
import { IFileManager } from "expensifier-logic/fs/fileManager.types";
import { injectable } from "inversify";
import { CreatesWritable } from "./fileMgr.types";

@injectable()
export class FileManager implements IFileManager {
    private fsRoot: FileSystemDirectoryHandle|undefined
    
    private async root() {
        try {
            if (!this.fsRoot) this.fsRoot = await navigator.storage.getDirectory() 
            return this.fsRoot
        } catch (err) {
            console.error('Failed getting site root', err)
            throw err
        }
        
    }
    clearFolder(_path: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    async fileAsJson<T>(file: AppFiles): Promise<T> {
        try {
            return JSON.parse(await this.getFileText(file)) as T
        } catch (err) {
            void this.writeJsonToFile(file, [])
            return [] as unknown as T
        }
    }

    async writeJsonToFile(file: AppFiles, data: unknown): Promise<void> {
        try {
            const hFile = await (await this.root()).getFileHandle(file, { create: true }) as unknown as CreatesWritable
            // Create a FileSystemWritableFileStream to write to.
            const writable = await hFile.createWritable();
            // Write the contents of the file to the stream.
            await writable.write(JSON.stringify(data));
            // Close the file and write the contents to disk.
            await writable.close();
        } catch (err) {
            console.error('Error writing json to file', err)
        }
    }

    async getFileText(file: AppFiles): Promise<string> {
        try {
            const hFile = await (await this.root()).getFileHandle(file, { create: true });
            return (await hFile.getFile()).text()
        } catch (err) {
            console.error('Error getting file text')
            throw err
        }
    }

    async exists(file: AppFiles): Promise<boolean> {
        try{
            await (await this.root()).getFileHandle(file, {create : false});
            return true
        } catch (err) {
            console.log('File existence check failed. i.e. file does not exist', err, file)
            return false
        }
    }
    readdir(_path: string): Promise<string[]> {
        throw new Error("Method not implemented.");
    }
    async readUploadedFile(name: string): Promise<ArrayBuffer> {
        try {
            const root = await this.root()
            const uploads = await root.getDirectoryHandle('uploads')
            const fileH = await uploads.getFileHandle(name)
            const file = await fileH.getFile()
            return file.arrayBuffer()
        } catch (err) {
            console.error('Error reading uploaded file', err)
            throw err
        }
    }
}
