import 'reflect-metadata'
import { inject, injectable } from "inversify";
import { ILogger } from "../logic/logger/types";
import { TYPES } from "./types";
import { IWebServer } from './webserver/types';
import { IEnvironment } from './environment/environment.types';
import { IRunner } from '../logic/fetcher/runner/types';
import { IFileManager } from '../logic/fs/fileManager.types';
import { ISheetIdentifier } from '../logic/fetcher/identifiers/identifier.types';
import { LOGIC_TYPES } from '../logic/types';

const UPLOAD_FOLDER = 'uploads'
@injectable()
export class Server {
	constructor(
		@inject(LOGIC_TYPES.ILogger) logger: ILogger,
		@inject(TYPES.IWebServer) webserver: IWebServer,
		@inject(TYPES.IEnvironment) env: IEnvironment,
		@inject(LOGIC_TYPES.IRunner) runner: IRunner,
		@inject(LOGIC_TYPES.IFileManager) fileManager: IFileManager,
		@inject(LOGIC_TYPES.ISheetIdentifier) sheetIdentifier: ISheetIdentifier,
	) {
		void (async () => {
			logger.log('Starting service')
			env.init()
			await fileManager.clearFolder(UPLOAD_FOLDER)
			await sheetIdentifier.init()
			webserver.init()
		})()
	}
}