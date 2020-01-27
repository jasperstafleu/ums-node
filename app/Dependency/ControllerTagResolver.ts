import {TagResolver} from "./TagResolver";
import {Container} from "./Container";
import {ControllerResolver} from "../Event/Listener/Controller/ControllerResolver";

module.exports = class ControllerTagResolver implements TagResolver
{
    resolve(container: Container, serviceName: string, tag: any): void
    {
        if (!('action' in tag && 'route' in tag)) {
            console.log(`Tag '${tag.name}' on '${serviceName}' ignored due to lack of 'action' or 'route' key.`);

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
