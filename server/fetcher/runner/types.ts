import { DataGuide, SheetIdentifier } from '../identifiers/types';

export interface IRunner {
    registerIdentifier: (id: SheetIdentifier, guides: DataGuide) => void
    run: (path: string) => Promise<void>
}