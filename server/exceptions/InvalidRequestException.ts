import { ServiceException } from './ServiceException'

export class InvalidRequestException extends ServiceException {
	constructor(message:string) {
		super(message, 400)
	}
}
