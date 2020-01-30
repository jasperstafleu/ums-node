import {IncomingMessage} from "http";
import ParamConverter from "$stafleu/Component/ParamConverter";
import Controller from "$stafleu/Controller/Controller";
import ControllerEvent from "$stafleu/Event/Event/ControllerEvent";

export default class ControllerResolver
{
    protected converters: ParamConverter[] = [];
    protected controllers: {route: string, controller: Controller, action: string, defaults: {[key: string]: string}}[] = [];

    addController(route: string, controller: Controller, action: string, defaults: {[key: string]: string} = {}): void
    {
        this.controllers.push({
            "route": route,
            "controller": controller,
            "action": action,
            "defaults": defaults
        });
    }

    addParamConverter(paramConverter: ParamConverter): void
    {
        this.converters.push(paramConverter);
    }

    handle(event: ControllerEvent): void
    {
        const result = this.getController(event.request);

        if (result !== undefined) {
            event.controller = (): any => result.action.apply(result.action, this.getParameters(result.routeArgs));
        }
    }

    protected getController(request: IncomingMessage): undefined | {action: Function, routeArgs: {[key: string]: string}}
    {
        let match, routeDefinition;

        for (let it = this.controllers.length - 1; it >= 0; --it) {
            routeDefinition = this.controllers[it];
            match = request.url !== undefined && (new RegExp(routeDefinition.route)).exec(request.url);

            if (match) {
                return {
                    action: (routeDefinition.controller as any)[routeDefinition.action],
                    routeArgs: typeof match === 'object' ? {...routeDefinition.defaults, ...match.groups} : routeDefinition.defaults
                };
            }
        }

        return undefined;
    }

    protected getParameters(routeArgs: {[key: string]: any}): any[]
    {
        let inject, args: any[] = [];

        for (let name of Object.keys(routeArgs || {})) {
            for (let it = this.converters.length - 1; it >= 0; --it) {
                if (this.converters[it].supports(name)) {
                    inject = this.converters[it].convert(name, routeArgs[name]);
                    args[inject.position] = inject.value;

                    break;
                }
            }
        }

        return args;
    }
}
