
export type FileSystemWriteableFileStream = {
    write: (d: string | ArrayBuffer) => Promise<void>
    close: () => Promise<void>
}

export type CreatesWritable = {
    createWritable: () => Promise<FileSystemWriteableFileStream>
}

export interface IDefaultFileLoader {
    verifyDefaultFiles: () => Promise<void>
} 