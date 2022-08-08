import { PathLike } from "fs";

export interface IFileManager {
    clearFolder(path: PathLike): Promise<void>
}
