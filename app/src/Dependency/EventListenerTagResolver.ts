import {EventEmitter} from "events";
import TagResolver from "$stafleu/Dependency/TagResolver";
import Logger from "$stafleu/Logger/Logger";
import Container from "$stafleu/Dependency/Container";

export default class EventListenerTagResolver implements TagResolver
{
    constructor(protected logger: Logger)
    {
    }

    resolve(container: Container, serviceName: string, tag: {[key: string]: any}): void
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
