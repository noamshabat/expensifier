import { IAPI } from 'expensifier-logic/shared.types';
import { ServerApi } from './serverApi';
import { WorkerApi } from './workerApi';

const enum APIProviders {
	Server='Server',
	Local='Local'
}

function getApiProvider(provider?: APIProviders) {
	switch (provider) {
	case APIProviders.Server: return new ServerApi();
	case APIProviders.Local: return new WorkerApi();
	default:
		throw new Error(`Invalid api provider specificied in API_PROVIDER env var: ${provider}`)
	}
}

const api: IAPI = getApiProvider(process.env.API_PROVIDER as APIProviders)
export default api