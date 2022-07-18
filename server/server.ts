import 'reflect-metadata'
import { inject, injectable } from "inversify";
import { ILogger } from "./logger/types";
import { TYPES } from "./types";
import { IWebServer } from './webserver/types';
import { EnvVar, IEnvironment } from './environment/environment.types';
import { IRunner } from './fetcher/runner/type';
import { RegisterCalCreditCard } from './fetcher/identifiers/cal';
import { RegisterDiscountBankCheckingAccount } from './fetcher/identifiers/discountBank';
import { RegisterIsracardCreditCard } from './fetcher/identifiers/isracard';

@injectable()
export class Server {
    constructor(
        @inject(TYPES.ILogger) logger: ILogger,
        @inject(TYPES.IWebServer) webserver: IWebServer,
        @inject(TYPES.IEnvironment) env: IEnvironment,
        @inject(TYPES.IRunner) runner: IRunner,
    ) {
        logger.log('Starting service')
        env.init()
        webserver.init()

        RegisterCalCreditCard(runner);
        RegisterDiscountBankCheckingAccount(runner);
        RegisterIsracardCreditCard(runner);
        runner.run(env.get(EnvVar.DATA_FOLDER))
    }
}