import {EventEmitter} from "events";
import TagResolver from "$stafleu/Dependency/TagResolver";
import Logger from "$stafleu/Logger/Logger";
import Container from "$stafleu/Dependency/Container";

export default class EventListenerTagResolver implements TagResolver
{
    protected logger: Logger;

    constructor(logger: Logger)
    {
        this.logger = logger;
    }

    resolve(container: Container, serviceName: string, tag: any): void
    {
        if (!('event' in tag && 'method' in tag)) {
            this.logger.notice(`Tag '${tag.name}' on '${serviceName}' ignored due to lack of 'event' or 'method' key.`);

            return;
        }

        container.decorate('event.emitter', (emitter: EventEmitter): void => {
            emitter.on(tag.event, (...args: any[]) => {
                const service = container.get(serviceName);
                service[tag.method].apply(service, args);
            });
        });
    }
}
