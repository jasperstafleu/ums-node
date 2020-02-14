import TagResolver from "$stafleu/Dependency/TagResolver";
import Container from "$stafleu/Dependency/Container";
import ControllerResolver from "$stafleu/Event/Listener/Controller/ControllerResolver";

export default class ParamConverterTagResolver implements TagResolver
{
    resolve(container: Container, serviceName: string, tag: {[key: string]: any}): void
    {
        container.decorate('event.controller_resolver', (resolver: ControllerResolver): void => {
            resolver.addParamConverter(container.get(serviceName));
        });
    }
}
