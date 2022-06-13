
const ServerHost = process.env.REACT_APP_SERVER_URL || 'http://localhost'
const ServerPort = process.env.REACT_APP_SERVER_PORT || '4000'

const _env = {
    ServerUrl: `${ServerHost}:${ServerPort}/`
}

export default _env as Readonly<typeof _env>