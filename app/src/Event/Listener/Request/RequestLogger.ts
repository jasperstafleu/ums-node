import Logger from "$stafleu/Logger/Logger";
import RequestEvent from "$stafleu/Event/Event/RequestEvent";

export default class RequestLogger
{
    constructor(protected logger: Logger) {
    }

    handle(event: RequestEvent): void {
        this.logger.info('Received request', {
            url: `${event.request.method} ${event.request.headers.host}${event.request.url}`
        });
    }
}
