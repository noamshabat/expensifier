import { Container } from "inversify";
import { Environment } from "./environment/environment";
import { Runner } from "./fetcher/runner/runner";
import { Logger } from "./logger/logger";
import { Mapper } from "./mapper/mappings";
import { Server } from "./server";
import { Store } from "./store/store";
import { TYPES } from "./types";
import { WebServer } from "./webserver/webserver";

export const container = new Container()
container.bind(TYPES.IServer).to(Server).inSingletonScope()
container.bind(TYPES.IEnvironment).to(Environment).inSingletonScope()
container.bind(TYPES.ILogger).to(Logger).inSingletonScope()
container.bind(TYPES.IMapper).to(Mapper).inSingletonScope()
container.bind(TYPES.IStore).to(Store).inSingletonScope()
container.bind(TYPES.IWebServer).to(WebServer).inSingletonScope()
container.bind(TYPES.IRunner).to(Runner).inSingletonScope()

// this starts the app
container.get(TYPES.IServer)