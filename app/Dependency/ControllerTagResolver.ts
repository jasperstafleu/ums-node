import {TagResolver} from "./TagResolver";
import {Container} from "./Container";
import {ControllerResolver} from "../Event/Listener/Controller/ControllerResolver";
import {Logger} from "../Logger/Logger";

module.exports = class ControllerTagResolver implements TagResolver
{
    protected logger: Logger;

    constructor(logger: Logger)
    {
        this.logger = logger;
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
};
