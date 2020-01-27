import {TagResolver} from "./TagResolver";
import {Container} from "./Container";
import {EventEmitter} from "events";

module.exports = class EventListenerTagResolver implements TagResolver
{
    resolve(container: Container, serviceName: string, tag: any): void
    {
        if (!('event' in tag && 'method' in tag)) {
            console.log(`Tag '${tag.name}' on '${serviceName}' ignored due to lack of 'event' or 'method' key.`);

            return;
        }

        container.decorate('event.emitter', (service: EventEmitter): void => {
            service.on(tag.event, (...args: any[]) => {
                let service = container.get(serviceName);
                service[tag.method].apply(service, args);
            });
        });
    }
};
