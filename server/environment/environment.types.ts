export const enum EnvVar {
    DATA_FOLDER='DATA_FOLDER',
    SERVER_PORT='SERVER_PORT',
}

export interface IEnvironment {
    init: VoidFunction,
    get: (name: EnvVar) => string
}