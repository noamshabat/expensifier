import _env from '../_env';
import { AddFilesResponse, APIEndpoints, AppFiles, Facets, FiltersDesc, GetMappingsResponse, GetTransactionsResponse, IAPI, Mapping, Methods, UploadedFiles } from 'expensifier-logic/shared.types';

export class ServerApi implements IAPI {
	// automatically call the toString() method on all properties of an object.
	private stringifyParams(params: { [key: string]: unknown }) {
		return Object.entries(params).reduce((stringifiedParams, [k, v]) => {
			stringifiedParams[k as keyof typeof stringifiedParams] = JSON.stringify(v)
			return stringifiedParams
		}, {} as { [key: string]: string })
	}

	private async runFetch(api: APIEndpoints, method: Methods, params?: { [key: string]: unknown }, body?: object) {
		const url = params ? `${this.path(api)}?${new URLSearchParams(this.stringifyParams(params))}` : this.path(api)
		return fetch(url, {
			method,
			headers: [['Content-Type', 'application/json']],
			body: (body && JSON.stringify(body) || undefined),
		})
	}
	private path(api: APIEndpoints) {
		return `${_env.ServerUrl}${api}`
	}

	async getTransactions(p:{filters: FiltersDesc, from?: number, to?: number}) {
		const response = await this.runFetch(APIEndpoints.Transactions, Methods.Get, p)
		return response.json() as Promise<GetTransactionsResponse>
	}

	async getMappings() {
		const response = await this.runFetch(APIEndpoints.Mappings, Methods.Get)
		return response.json() as Promise<GetMappingsResponse>
	}

	async addMapping(p:{ mapping: Mapping, categoryIndex: number }) {
		await this.runFetch(APIEndpoints.Mappings, Methods.Post, { index: p.categoryIndex }, p.mapping)
	}

	async getFacets(p: { filters: FiltersDesc }) {
		const response = await this.runFetch(APIEndpoints.Facets, Methods.Get, p)
		return response.json() as Promise<Facets>
	}

	async addFiles(p: { files: UploadedFiles }) {
		// Create an object of formData 
		const formData = new FormData();

		for (const file of p.files as unknown as FileList) {
			formData.append(
				'files',
				file,
				file.name,
			);
		}
		const res = await fetch(this.path(APIEndpoints.AddFiles), {
			method: Methods.Post,
			body: formData,
		})
		return res.json() as Promise<AddFilesResponse>
	}

	async getConfigFile (p: { file: AppFiles; }) {
		throw new Error('missing implementation')
		return Promise.resolve(p)
	}
	async setConfigFile (_p: { file: AppFiles; }) {
		throw new Error('missing implementation')
		return Promise.resolve()
	}
}
