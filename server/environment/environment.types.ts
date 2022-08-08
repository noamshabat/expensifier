export const enum EnvVar {
    SERVER_PORT='SERVER_PORT',
}

export interface IEnvironment {
    init: VoidFunction,
    get: (name: EnvVar) => string
}