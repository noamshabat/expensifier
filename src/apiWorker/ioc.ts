import { Container } from 'inversify'
import { LOGIC_TYPES } from 'expensifier-logic/types'
import { ExcelProcessor } from 'expensifier-logic//fetcher/excel/excelProcessor';
import { DateFormatAnalyzer } from 'expensifier-logic//fetcher/identifiers/dateFormatAnalyzer';
import { SheetIdentifier } from 'expensifier-logic//fetcher/identifiers/sheetIdentifier';
import { Runner } from 'expensifier-logic//fetcher/runner/runner';
import { Integration } from 'expensifier-logic//integration/integration';
import { Logger } from 'expensifier-logic//logger/logger';
import { Mapper } from 'expensifier-logic//mapper/mappings';
import { Store } from 'expensifier-logic//store/store';
import { FileManager } from './fileManager';
import { DefaultFilesLoader, DefaultFilesSymbol } from './defaultFilesLoader';
import { IDefaultFileLoader } from './fileMgr.types';

let verified = false
let verifyPromise:Promise<void>
export async function setupContainer() {
	const container = new Container()
	container.bind(LOGIC_TYPES.IFileManager).to(FileManager).inSingletonScope()
	container.bind(DefaultFilesSymbol).to(DefaultFilesLoader).inSingletonScope()
	if (!verified) {
		if (!verifyPromise) {
			console.log('Starting default files verification')
			const defaultsLoader = container.get<IDefaultFileLoader>(DefaultFilesSymbol)
			verifyPromise = defaultsLoader.verifyDefaultFiles()
		}
		await verifyPromise
		verified = true
	}
	
	container.bind(LOGIC_TYPES.ILogger).to(Logger).inSingletonScope()
	container.bind(LOGIC_TYPES.IMapper).to(Mapper).inSingletonScope()
	container.bind(LOGIC_TYPES.IStore).to(Store).inSingletonScope()
	container.bind(LOGIC_TYPES.IRunner).to(Runner).inSingletonScope()
	container.bind(LOGIC_TYPES.ISheetIdentifier).to(SheetIdentifier).inSingletonScope()
	container.bind(LOGIC_TYPES.IExcelProcessor).to(ExcelProcessor).inSingletonScope()
	container.bind(LOGIC_TYPES.IDateFromatAnalyzer).to(DateFormatAnalyzer).inSingletonScope()
	container.bind(LOGIC_TYPES.IIntegration).to(Integration).inSingletonScope()
	
	return container
}
