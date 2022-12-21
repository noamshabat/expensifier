
export interface IWebServer {
	init: () => void
	stop: () => Promise<void>
}