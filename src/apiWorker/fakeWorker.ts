import { ApiMessage, ApiMessageBase } from "./api.types";
import { processWorkerMessage } from "./apiEntry.worker";

type ListenerCallback = (data: MessageEvent<ApiMessageBase>) => void

export class FakeWorker {
    private listeners: { 
        message: ListenerCallback[],
        error: ListenerCallback[],
        messageerror: ListenerCallback[],
    } = { message: [], error: [], messageerror: []}
    async postMessage(message: { id: string, data: ApiMessage }) {
        try {
            const res = await processWorkerMessage(message.id, message.data)
            this.listeners.message.forEach((l) => l(new MessageEvent('message', {data: res})))
        } catch (err) {
            console.error(err)
            this.listeners.messageerror.forEach((l) => l(new MessageEvent('messageerror', {data: { id: message.id, type: message.data.type, data: err}})))
        }
    }

    addEventListener(type: 'message' | 'error' | 'messageerror', callback: ListenerCallback) {
        this.listeners[type].push(callback)
    }
}

export default FakeWorker