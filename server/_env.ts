
import { config } from 'dotenv'
import { log } from './logger'
config({ path: '.env.server' })

const envType = {
	DATA_FOLDER: '',
	SERVER_PORT: '',
}

export const ENV = process.env as typeof envType

Object.keys(envType).forEach((k) => {
	if (!ENV[k as keyof typeof ENV]) {
		log(`Fatal Error! Missing environment variable ${k}`)
		process.exit(1)
	}
})