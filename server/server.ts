import 'reflect-metadata'
import { inject, injectable } from "inversify";
import { ILogger } from "./logger/types";
import { TYPES, UPLOAD_FOLDER } from "./types";
import { IWebServer } from './webserver/types';
import { IEnvironment } from './environment/environment.types';
import { IRunner } from './fetcher/runner/types';
import { RegisterCalCreditCard } from './fetcher/identifiers/cal';
import { RegisterDiscountBankCheckingAccount } from './fetcher/identifiers/discountBank';
import { RegisterIsracardCreditCard } from './fetcher/identifiers/isracard';
import { IFileManager } from './fs/fileManager.types';

@injectable()
export class Server {
    constructor(
        @inject(TYPES.ILogger) logger: ILogger,
        @inject(TYPES.IWebServer) webserver: IWebServer,
        @inject(TYPES.IEnvironment) env: IEnvironment,
        @inject(TYPES.IRunner) runner: IRunner,
        @inject(TYPES.IFileManager) fileManager: IFileManager,
    ) {
        logger.log('Starting service')
        env.init()
        fileManager.clearFolder(UPLOAD_FOLDER)
        webserver.init()

        RegisterCalCreditCard(runner);
        RegisterDiscountBankCheckingAccount(runner);
        RegisterIsracardCreditCard(runner);
    }
}