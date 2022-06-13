import express, { Request, Response, Express, NextFunction } from 'express'
import { Server } from 'http'
import { log } from './logger'
import { store } from './store/store'
import cors from 'cors'
import { getMappings, setMappings } from './config/mappings'

let server:Server

/**
 * Initializes all app routes
 * @param app - an express instance.
 */
function initRoutes(app:Express) {
  // test route - just to make sure the webserver is running.
  app.get('/test', (req:Request, res: Response) => {
    res.sendStatus(200)
  })

  // shuts down the service.
  app.get('/shutdown', (req:Request, res: Response) => {
    res.status(200).send('Shutting down')
    stopServer()
  })

  app.get('/transactions', (req: Request, res: Response) => {
    res.status(200).send(store.records)
  })

  app.get('/mappings', (req: Request, res: Response) => {
    res.status(200).json(getMappings())
  })

  app.post('/mappings', (req: Request, res: Response) => {
    console.log(req.body.mappings)
    setMappings(req.body.mappings)
    res.status(200).send('ok')
  })

  // if we got here we don't know this route. return 404.
  app.all('*', function(req, res){
    res.status(404).send('unknown route')
  });
}

/**
 * Middleware to log incoming requests and responses.
 */
function expressLogger(req:Request, res:Response, next:NextFunction) {
  // log the incoming request
  log(`Incoming request:`, { path: req.path, method: req.method, query: req.query, body: req.body, headers: req.headers })
  
  // hold the original send function.
  const send = res.send

  // create a new send function that logs the response.
  res.send = function(body:any) {
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
async function errorMiddleware(err:any, req:Request, res:Response, next:NextFunction) {
	if (err.serviceException) {
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
export function initServer() {
  const app = express()
	const port = process.env.REACT_APP_SERVER_PORT

  app.use(express.json());
  app.use(expressLogger)
  app.use(cors({
    origin: 'http://192.168.6.128:3000',
  }))
	initRoutes(app)
	app.use(errorMiddleware)

	return new Promise<void>((resolve) => {
		server = app.listen(port, () => {
			log(`Express listening at http://localhost:${port}`)
			resolve()
		})
	})
}

/**
 * Shuts down the webserver if it is running.
 */
export async function stopServer() {
  if (server) {
    log('Web server shutting down')
		await new Promise((res) => {
      try {
        server!.close(res)
      } catch(err) {
        log('Error while shutting down', err)
        process.exit(1)
      }
		})
	}
}