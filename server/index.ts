import { Container } from "inversify";
import { Environment } from "./environment/environment";
import { ExcelProcessor } from "../logic/fetcher/excel/excelProcessor";
import { DateFormatAnalyzer } from "../logic/fetcher/identifiers/dateFormatAnalyzer";
import { SheetIdentifier } from "../logic/fetcher/identifiers/sheetIdentifier";
import { Runner } from "../logic/fetcher/runner/runner";
import { FileManager } from "./fileManager";
import { Integration } from "../logic/integration/integration";
import { Logger } from "../logic/logger/logger";
import { Mapper } from "../logic/mapper/mappings";
import { Server } from "./server";
import { Store } from "../logic/store/store";
import { TYPES } from "./types";
import { LOGIC_TYPES } from '../logic/types'
import { WebServer } from "./webserver/webserver";

export const container = new Container()
container.bind(TYPES.IServer).to(Server).inSingletonScope()
container.bind(TYPES.IEnvironment).to(Environment).inSingletonScope()
container.bind(LOGIC_TYPES.ILogger).to(Logger).inSingletonScope()
container.bind(LOGIC_TYPES.IMapper).to(Mapper).inSingletonScope()
container.bind(LOGIC_TYPES.IStore).to(Store).inSingletonScope()
container.bind(TYPES.IWebServer).to(WebServer).inSingletonScope()
container.bind(LOGIC_TYPES.IRunner).to(Runner).inSingletonScope()
container.bind(LOGIC_TYPES.IFileManager).to(FileManager).inSingletonScope()
container.bind(LOGIC_TYPES.ISheetIdentifier).to(SheetIdentifier).inSingletonScope()
container.bind(LOGIC_TYPES.IExcelProcessor).to(ExcelProcessor).inSingletonScope()
container.bind(LOGIC_TYPES.IDateFromatAnalyzer).to(DateFormatAnalyzer).inSingletonScope()
container.bind(LOGIC_TYPES.IIntegration).to(Integration).inSingletonScope()

// this starts the app
container.get(TYPES.IServer)