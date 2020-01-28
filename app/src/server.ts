import 'module-alias/register';
import * as http from "http";
import {IncomingMessage, ServerResponse} from "http";
import {container} from "$stafleu/Dependency/Container";

if (!(process.env.UMS_SERVER_PORT && parseInt(process.env.UMS_SERVER_PORT))) {
  throw Error('UMS_SERVER_PORT env variable must be defined and a number');
}

const server = http.createServer(
    (request: IncomingMessage, response: ServerResponse) => container.get('kernel').handle(request, response)
);

server.listen(parseInt(process.env.UMS_SERVER_PORT), process.env.UMS_HOSTNAME, () => {
  container.get('logger').info(`Server running in ${process.env.NODE_ENV} mode`);
});
