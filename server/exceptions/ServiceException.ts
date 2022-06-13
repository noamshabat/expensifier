
// All service exceptions are expected to inherit this exception.
// this exception mandates adding name and code to the exception - and helps with generic handling.
export abstract class ServiceException extends Error {
	code:number
	serviceException = true
	constructor(message:string, code:number) {
		super(message)
		this.name = this.constructor.name
		this.code = code
	}
}
