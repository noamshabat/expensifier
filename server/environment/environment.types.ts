export const enum EnvVar {
	SERVER_PORT='SERVER_PORT',
	DATA_PATH='DATA_PATH',
}

export interface IEnvironment {
	init: () => void,
	get: (name: EnvVar) => string
}