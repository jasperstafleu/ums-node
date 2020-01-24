'use strict';

import {TagResolver} from "./TagResolver";
import {Container} from "./Container";

module.exports = class EventListenerTagResolver implements TagResolver
{
    resolve(container: Container, serviceName: string, tag: any): void
    {
        if (!('event' in tag && 'method' in tag)) {
            return;
        }

        const emitterDefinition = container.getDefinition('event.emitter');
        container.addService('event.emitter', () => {
            let emitter = emitterDefinition.call();

            emitter.on(tag.event, (...args: any[]) => {
                let service = container.get(serviceName);
                service[tag.method].apply(service, args);
            });

            return emitter;
        });
    }
};
