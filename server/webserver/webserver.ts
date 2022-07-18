import 'reflect-metadata'
import express, { Request, Response, Express, NextFunction } from 'express'
import { Server } from 'http'
import cors from 'cors'
import { ServiceException } from '../exceptions/ServiceException'
import { IWebServer } from './types'
import { inject, injectable } from 'inversify'
import { IMapper } from '../mapper/types'
import { TYPES } from '../types'
import { ALL_FACETS, IStore } from '../store/types'
import { ILogger } from '../logger/types'
import { EnvVar, IEnvironment } from '../environment/environment.types'

@injectable()
export class WebServer implements IWebServer {
	private _mapper: IMapper
	private _store: IStore
	private _logger: ILogger
	private _env: IEnvironment

	private _server: Server|null = null

	constructor(
		@inject(TYPES.IMapper) mapper: IMapper,
		@inject(TYPES.IStore) store: IStore,
		@inject(TYPES.ILogger) logger: ILogger,
		@inject(TYPES.IEnvironment) env: IEnvironment,
	) {
		this._mapper = mapper
		this._store = store
		this._logger = logger
		this._env = env
	}

	/**
	 * Initializes all app routes
	 * @param app - an express instance.
	 */
	private initRoutes(app: Express) {
		// test route - just to make sure the webserver is running.
		app.get('/test', (req: Request, res: Response) => {
			res.sendStatus(200)
		})

		// shuts down the service.
		app.get('/shutdown', (req: Request, res: Response) => {
			res.status(200).send('Shutting down')
			this.stop()
		})

		app.get('/transactions', (req: Request, res: Response) => {
			res.status(200).send(this._store.getAll())
		})

		app.get('/mappings', (req: Request, res: Response) => {
			res.status(200).json(this._mapper.getMappings())
		})

		app.get('/facets', (req: Request, res: Response) => {
			res.status(200).json(this._store.getDistinctFacetValues(ALL_FACETS))
		})

		app.post('/mappings', (req: Request, res: Response) => {
			console.log(req.body)
			this._mapper.addMapping(req.body)
			this._store.reProcessTransactions()
			res.status(200).send('ok')
		})

		// if we got here we don't know this route. return 404.
		app.all('*', function (req, res) {
			res.status(404).send('unknown route')
		});
	}

	/**
	 * Middleware to log incoming requests and responses.
	 */
	private expressLogger = (req: Request, res: Response, next: NextFunction) => {
		// log the incoming request
		this._logger.log(`Incoming request:`, { path: req.path, method: req.method, query: req.query, body: req.body, headers: req.headers })

		// hold the original send function.
		const send = res.send

		// create a new send function that logs the response.
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		res.send = function (body: any) {
			// log(`Path:'${req.path}' response:`, body)
			return send.call(this, body)
		}
		next()
	}

	/**
	 * Used as an error middleware for express. expects to get a serviceException as the first argument.
	 * can fallback to standard javascript Error when required.
	 * 
	 * All arguments are standard express error middleware arguments.
	 */
	private async errorMiddleware(err: ServiceException | Error, req: Request, res: Response) {
		if (err instanceof ServiceException && err.serviceException) {
			res.status(err.code).send(err.message)
		} else {
			const msg = JSON.stringify(err)
			res.status(500).send(msg)
		}
	}

	/**
	 * Initializes express webserver.
	 * @returns Promise<void>
	 */
	init() {
		const app = express()
		const port = this._env.get(EnvVar.SERVER_PORT)

		app.use(express.json());
		app.use(this.expressLogger)
		app.use(cors({
			origin: 'http://localhost:3000',
		}))
		this.initRoutes(app)
		app.use(this.errorMiddleware)

		return new Promise<void>((resolve) => {
			this._server = app.listen(port, () => {
				this._logger.log(`Express listening at http://localhost:${port}`)
				resolve()
			})
		})
	}

	/**
	 * Shuts down the webserver if it is running.
	 */
	public async stop() {
		if (this._server) {
			this._logger.log('Web server shutting down')
			await new Promise((res) => {
				try {
					this._server && this._server.close(res)
				} catch (err) {
					this._logger.log('Error while shutting down', err)
					process.exit(1)
				}
			})
		}
	}
}