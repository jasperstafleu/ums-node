import Logger from "$stafleu/Logger/Logger";
import RequestEvent from "$stafleu/Event/Event/RequestEvent";

export default class RequestLogger
{
    protected logger: Logger;

    constructor(logger: Logger) {
        this.logger = logger;
    }

    handle(event: RequestEvent): void {
        this.logger.info('Received request', {
            url: `${event.request.method} ${event.request.headers.host}${event.request.url}`
        });
    }
}
