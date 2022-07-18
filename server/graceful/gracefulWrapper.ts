import { inject, injectable } from 'inversify';
import Graceful from 'node-graceful';
import { ILogger } from '../logger/types';
import { TYPES } from '../types';
import { IWebServer } from '../webserver/types';

@injectable()
export class GracefulWrapper {
    constructor(
        @inject(TYPES.IWebServer) webserver: IWebServer,
        @inject(TYPES.ILogger) logger: ILogger,
    ) {
        // Shutdown gracefully on any unhandled exception, rejection or signal.
        Graceful.captureExceptions = true;
        Graceful.captureRejections = true;
        Graceful.on('exit', async (signal: string, details?: object) => {
        logger.log('---- Graceful exit called ----')
        logger.log('\tSignal: \t', signal)
        details && logger.log('\tDetails: \t', details)
        logger.log('------------------------------')
        // stops the webserver
        await webserver.stop()
        });
    }
}
