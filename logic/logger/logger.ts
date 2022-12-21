import 'reflect-metadata'
import { injectable } from "inversify";
import { ILogger } from "./types";

@injectable()
export class Logger implements ILogger {
	log(...args: unknown[]) {
		console.log(new Date().toISOString() + "\t\t",...args)
	}
}
