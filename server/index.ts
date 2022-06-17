import { ENV } from './_env' // Load environment vars before anything.
import { log } from './logger'
import { initServer, stopServer } from './webserver'
import Graceful from 'node-graceful';
import { processFolder } from './fetcher';

// Shutdown gracefully on any unhandled exception, rejection or signal.
Graceful.captureExceptions = true;
Graceful.captureRejections = true;
Graceful.on('exit', async (signal: string, details?: object) => {
  log('---- Graceful exit called ----')
  log('\tSignal: \t', signal)
  details && log('\tDetails: \t', details)
  log('------------------------------')
  // stops the webserver
  await stopServer()
});

// starts the service.
async function run() {
  log('Starting service')
  // start the web server.
  await initServer()
  processFolder(ENV.DATA_FOLDER)
}

run()