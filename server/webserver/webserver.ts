import 'reflect-metadata'
import express, { Request, Response, Express, NextFunction } from 'express'
import { Server } from 'http'
import cors from 'cors'
import { ServiceException } from '../exceptions/ServiceException'
import { IWebServer } from './types'
import { inject, injectable } from 'inversify'
import { TYPES, UPLOAD_FOLDER } from '../types'
import { FiltersDesc } from '../../logic/store/store.types'
import { ILogger } from '../../logic/logger/types'
import { EnvVar, IEnvironment } from '../environment/environment.types'
import { APIEndpoints, IAPI } from '../shared.types'
import { InvalidRequestException } from '../exceptions/InvalidRequestException'
import multer from 'multer'
import path from 'path'
import { LOGIC_TYPES } from '../../logic/types'

const storage = multer.diskStorage({
	destination: function (_req, _file, cb) { cb(null, UPLOAD_FOLDER) },
	filename: function (_req, file, cb) { cb(null, Date.now() + path.extname(file.originalname)) }
})
const upload = multer({ storage })

@injectable()
export class WebServer implements IWebServer {
	private logger: ILogger
	private env: IEnvironment
	private integration: IAPI

	private _server: Server|null = null

	constructor(
		@inject(LOGIC_TYPES.ILogger) logger: ILogger,
		@inject(TYPES.IEnvironment) env: IEnvironment,
		@inject(LOGIC_TYPES.IIntegration) integration: IAPI,
	) {
		this.logger = logger
		this.env = env
		this.integration = integration
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
		app.get('/shutdown', (_: Request, res: Response) => {
			res.status(200).send('Shutting down')
			this.stop()
		})

		app.get(`/${APIEndpoints.Transactions}`, (req: Request, res: Response) => {
			const filters = (req.query.filters ? JSON.parse(req.query.filters as string) : {}) as FiltersDesc
			const from = parseInt(req.query.from as string)
			const to = parseInt(req.query.to as string)
			res.status(200).send(this.integration.getTransactions(filters, from, to))
		})

		app.get(`/${APIEndpoints.Mappings}`, (_: Request, res: Response) => {
			res.status(200).json(this.integration.getMappings())
		})

		app.get(`/${APIEndpoints.Facets}`, (req: Request, res: Response) => {
			const filters = (req.query.filters ? JSON.parse(req.query.filters as string) : {}) as FiltersDesc
			res.status(200).json(this.integration.getFacets(filters))
		})

		app.post(`/${APIEndpoints.Mappings}`, (req: Request, res: Response) => {
			console.log(req.body)
			const cateogryIndex = parseInt(req.query.index as string)
			if (isNaN(cateogryIndex)) throw new InvalidRequestException('Required "index" argument"')
			this.integration.addMapping(req.body, cateogryIndex)
			res.status(200).send('ok')
		})

		app.post(`/${APIEndpoints.AddFiles}`, upload.array('files', 20), async (req: Express.Request, res) => {
			if(!req.files) {
				this.logger.log('No files uploaded')
				res.send({
					status: false,
					message: 'No file uploaded'
				});
				return
			}
			this.logger.log('Uploading files')
			await this.integration.addFiles(UPLOAD_FOLDER)
			res.send({ processed: req.files.length }) // TODO - take from addFiles response
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
		this.logger.log(`Incoming request:`, { path: req.path, method: req.method, query: req.query, body: req.body, headers: req.headers })
		const start = new Date().getTime()
		// hold the original send function.
		const send = res.send

		const logger = this.logger
		// create a new send function that logs the response.
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		res.send = function (body: any) {
			// logger.log(`Path:'${req.path}' response: (${body})`)
			logger.log(`Path:'${req.path}' request duration: (${new Date().getTime()-start}ms)`)
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
		const port = this.env.get(EnvVar.SERVER_PORT)

		app.use(this.expressLogger)
		app.use(cors({
			origin: 'http://localhost:3000',
		}))
		
		app.use(express.json());
		this.initRoutes(app)
		app.use(this.errorMiddleware)

		return new Promise<void>((resolve) => {
			this._server = app.listen(port, () => {
				this.logger.log(`Express listening at http://localhost:${port}`)
				resolve()
			})
		})
	}

	/**
	 * Shuts down the webserver if it is running.
	 */
	public async stop() {
		if (this._server) {
			this.logger.log('Web server shutting down')
			await new Promise((res) => {
				try {
					this._server && this._server.close(res)
				} catch (err) {
					this.logger.log('Error while shutting down', err)
					process.exit(1)
				}
			})
		}
	}
}