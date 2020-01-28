import RequestEvent from "../../Event/RequestEvent";
import Logger from "../../../Logger/Logger";

class RequestLogger {
    private logger: Logger;

    constructor(logger: Logger) {
        this.logger = logger;
    }

    handle(event: RequestEvent): void {
        this.logger.info('Received request', {
            url: `${event.request.method} ${event.request.headers.host}${event.request.url}`
        });
    }
}

module.exports = RequestLogger;
