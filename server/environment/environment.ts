
import 'reflect-metadata'
import { config } from 'dotenv'
import { inject, injectable } from 'inversify'
import { ILogger } from '../../logic/logger/types'
import { EnvVar, IEnvironment } from './environment.types'
import { LOGIC_TYPES } from '../../logic/types'
config({ path: '.env.server' })

const envType: { [key in EnvVar]: string} = {
	[EnvVar.SERVER_PORT]: '',
	[EnvVar.DATA_PATH]: '',
}

@injectable()
export class Environment implements IEnvironment {
	private _logger
    private _env: typeof envType = process.env as typeof envType

	constructor(
		@inject(LOGIC_TYPES.ILogger) logger: ILogger,
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
