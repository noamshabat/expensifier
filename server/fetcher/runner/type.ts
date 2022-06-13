import { DataGuide, SheetIdentifier } from '../identifiers/type';

export interface IRunner {
    registerIdentifier: (id: SheetIdentifier, guides: DataGuide) => void
    run: (path: string) => Promise<void>
}