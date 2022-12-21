// import ApiWorker from 'worker-loader!../apiWorker/apiEntry.worker';
import ApiWorker from '../apiWorker/fakeWorker';
import { ApiMessage, ApiMessageResponse, API_WORKER_MESSAGE_IDENTIFIER } from '../apiWorker/api.types';
import { AddFilesResponse, APIs, AppFiles, FiltersDesc, GetFacetsResponse, GetMappingsResponse, GetTransactionsResponse, IAPI, Mapping, UploadedFiles } from "expensifier-logic/shared.types";
import { v4 as uuid} from 'uuid'
import { CreatesWritable } from '../apiWorker/fileMgr.types';

export class WorkerApi implements IAPI {
    private worker = new ApiWorker();
    private waiters: { [key: string]: { resolve: (data: unknown) => void, reject: (data: unknown) => void} } = {}

    constructor() {
        this.worker.addEventListener('message', this.onMessage)
        this.worker.addEventListener('error', this.error)
        this.worker.addEventListener('messageerror', this.messageError)
    }
	
    private onMessage = (event: MessageEvent) => {
        console.log('Received message', event.data.type, event.data)
        const data = event.data as ApiMessageResponse
        if (!this.waiters[data.id]) {
            console.error('Response arrived for message we are not waiting on', data.id)
            return
        }
        this.waiters[data.id].resolve(data.data)
        delete this.waiters[data.id]
    }

    private error = (event: Event) => {
        console.log('Received error', event)
    }

    private messageError = (event: MessageEvent) => {
        console.log('Received message error', event)
        const data = event.data as ApiMessageResponse
        if (!this.waiters[data.id]) {
            console.error('Response arrived for message we are not waiting on', data.id)
            return
        }
        this.waiters[data.id].reject(data.data)
        delete this.waiters[data.id]
    }

    private postMessage = (data: ApiMessage) => {
        return new Promise((resolve, reject) => {
            data.source = API_WORKER_MESSAGE_IDENTIFIER
            const id = uuid()
            this.waiters[id] = {resolve, reject}
            this.worker.postMessage({id, data})        
        })
    }

    getTransactions = async (p: { filters: FiltersDesc, from?: number | undefined, to?: number | undefined }) => this.postMessage({type: APIs.GetTransactions, args: p }) as Promise<GetTransactionsResponse>
    getMappings = async () => this.postMessage({type: APIs.GetMappings, args: undefined }) as Promise<GetMappingsResponse>
    getFacets = async (p: { filters: FiltersDesc }) => this.postMessage({type: APIs.GetFacets, args: p }) as Promise<GetFacetsResponse>
    addMapping = async (p: { mapping: Mapping, categoryIndex: number }) => this.postMessage({type: APIs.AddMapping, args: p }) as Promise<void>
    addFiles = async (p: { files: UploadedFiles }) => {
        const root = await navigator.storage.getDirectory()
        const uploads = await root.getDirectoryHandle('uploads', { create: true })
        const apiFiles = []
        for ( const file of p.files as unknown as FileList) {
            // TODO: check if the file exists first - we don't want to override previous input.
            const fileH = await uploads.getFileHandle(file.name, { create: true }) as unknown as CreatesWritable
            const writable = await fileH.createWritable();
            await writable.write(await file.arrayBuffer())
            await writable.close()
            apiFiles.push({ name: file.name})
        }
        return this.postMessage({type: APIs.AddFiles, args: {files: apiFiles} }) as Promise<AddFilesResponse>
    }

	getConfigFile  = async (p: { file: AppFiles; }) => this.postMessage({ type: APIs.GetConfigFile, args: p}) as Promise<object>
	setConfigFile  = async (p: { file: AppFiles, data: unknown }) => this.postMessage({ type: APIs.SetConfigFile, args: p}) as Promise<void>
}
