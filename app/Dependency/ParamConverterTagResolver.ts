'use strict';

import {TagResolver} from "./TagResolver";
import {Container} from "./Container";
import {ControllerResolver} from "../Event/Listener/Controller/ControllerResolver";

module.exports = class ParamConverterTagResolver implements TagResolver
{
    resolve(container: Container, serviceName: string, tag: any): void
    {
        container.decorate('event.controller_resolver', (resolver: ControllerResolver) => {
            resolver.addParamConverter(container.get(serviceName));
        });
    }
};
