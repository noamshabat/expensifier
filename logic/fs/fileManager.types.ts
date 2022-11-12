import { AppFiles } from "../shared.types"

export interface IFileManager {
    clearFolder(path: string): Promise<void>
    fileAsJson<T>(file: AppFiles): Promise<T>
    writeJsonToFile(file: AppFiles, data: unknown): Promise<void>
    exists(file: AppFiles): Promise<boolean>
    readdir(path: string): Promise<string[]>
    readUploadedFile(name: string): Promise<ArrayBuffer>
}
