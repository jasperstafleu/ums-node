'use strict';

import {TagResolver} from "./TagResolver";
import {Container} from "./Container";

module.exports = class ParamConverterTagResolver implements TagResolver
{
    resolve(container: Container, serviceName: string, tag: any): void
    {
        const resolverDefinition = container.getDefinition('event.controller_resolver');
        container.addService('event.controller_resolver', () => {
            let resolver = resolverDefinition.call();

            resolver.addParamConverter(container.get(serviceName));

            return resolver;
        });
    }
};
