import TagResolver from "./TagResolver";
import Container from "./Container";
import ControllerResolver from "../Event/Listener/Controller/ControllerResolver";

class ParamConverterTagResolver implements TagResolver
{
    resolve(container: Container, serviceName: string, tag: any): void
    {
        container.decorate('event.controller_resolver', (resolver: ControllerResolver): void => {
            resolver.addParamConverter(container.get(serviceName));
        });
    }
}

module.exports = ParamConverterTagResolver;
