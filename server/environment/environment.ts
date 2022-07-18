
import 'reflect-metadata'
import { config } from 'dotenv'
import { inject, injectable } from 'inversify'
import { ILogger } from '../logger/types'
import { TYPES } from '../types'
import { EnvVar, IEnvironment } from './environment.types'
config({ path: '.env.server' })

const envType: { [key in EnvVar]: string} = {
	[EnvVar.DATA_FOLDER]: '',
	[EnvVar.SERVER_PORT]: '',
}

@injectable()
export class Environment implements IEnvironment {
	private _logger
    private _env: typeof envType = process.env as typeof envType

	constructor(
		@inject(TYPES.ILogger) logger: ILogger,
	) {
		this._logger = logger
	}
	
	init() {
		Object.keys(envType).forEach((k) => {
			if (!this._env[k as keyof typeof this._env]) {
				this._logger.log(`Fatal Error! Missing environment variable ${k}`)
				process.exit(1)
			}
		})
	}

    get(key: EnvVar) {
        return this._env[key]
    }
}
