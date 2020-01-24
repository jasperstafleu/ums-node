'use strict';

import {TagResolver} from "./TagResolver";
import {Container} from "./Container";

module.exports = class ControllerTagResolver implements TagResolver
{
    resolve(container: Container, serviceName: string, tag: any): void
    {
        if (!('action' in tag && 'route' in tag)) {
            return;
        }

        const resolverDefinition = container.getDefinition('event.controller_resolver');
        container.addService('event.controller_resolver', () => {
            let resolver = resolverDefinition.call();

            resolver.addController(new RegExp(tag.route), container.get(serviceName), tag.action);

            return resolver;
        });
    }
};
