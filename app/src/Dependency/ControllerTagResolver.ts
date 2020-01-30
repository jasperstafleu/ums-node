import TagResolver from "$stafleu/Dependency/TagResolver";
import Logger from "$stafleu/Logger/Logger";
import Container from "$stafleu/Dependency/Container";
import ControllerResolver from "$stafleu/Event/Listener/Controller/ControllerResolver";

export default class ControllerTagResolver implements TagResolver
{
    constructor(protected logger: Logger)
    {
    }

    resolve(container: Container, serviceName: string, tag: any): void
    {
        if (!('action' in tag && 'route' in tag)) {
            this.logger.notice(`Tag '${tag.name}' on '${serviceName}' ignored due to lack of 'action' or 'route' key.`);

            return;
        }

        container.decorate('event.controller_resolver', (resolver: ControllerResolver): void => {
            resolver.addController(
                tag.route,
                container.get(serviceName),
                tag.action,
                tag.defaults || {}
            );
        });
    }
}
