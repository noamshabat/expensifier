import { LOGIC_TYPES } from "expensifier-logic/types";
import { Container } from "inversify";
import { APIs, IAPI } from "expensifier-logic/shared.types";
import { ApiMessage, ApiMessageResponse, API_WORKER_MESSAGE_IDENTIFIER } from "./api.types";
import { setupContainer } from "./ioc";

declare const self: DedicatedWorkerGlobalScope;

export default {} as typeof Worker & { new (): Worker };

let container: Container|undefined
let integration: IAPI 

export async function processWorkerMessage(id: string, message: ApiMessage): Promise<ApiMessageResponse> {
    if (!container) container = await setupContainer()
    if (!integration) integration = container.get<IAPI>(LOGIC_TYPES.IIntegration)
    switch (message.type) {
        case APIs.GetTransactions: return {id, type: message.type, data: await integration[message.type](message.args)}
        case APIs.GetMappings: return {id, type: message.type, data: await integration[message.type]()}
        case APIs.GetFacets: return {id, type: message.type, data: await integration[message.type](message.args)}
        case APIs.AddMapping: return {id, type: message.type, data: await integration[message.type](message.args)}
        case APIs.AddFiles: return {id, type: message.type, data: await integration[message.type](message.args)}
		case APIs.GetConfigFile: return {id, type: message.type, data: await integration[message.type](message.args)}
		case APIs.SetConfigFile: return {id, type: message.type, data: await integration[message.type](message.args)}
    }
}

self.addEventListener('message', evt => {
    if (evt.data.source !== API_WORKER_MESSAGE_IDENTIFIER) return
    console.log('web worker got message', evt)
    try {
        const { id, data } = evt.data as { id: string, data: ApiMessage }
        (async () => {
            const res = await processWorkerMessage(id, data)
            self.postMessage(res)
        })()
    } catch(err) {
        console.log('Failed processing message', evt, err)
    }
    console.log(new Date())
})