'use strict';

import {ControllerEvent} from "../../Event/ControllerEvent";
import {Controller} from "../../../Controller/Controller";
import {IncomingMessage} from "http";
import {ParamConverter} from "../../../Component/ParamConverter";

export class ControllerResolver
{
    protected converters: ParamConverter[] = [];
    protected controllers: {route: RegExp, controller: Controller, action: string}[] = [];

    handle(event: ControllerEvent): void
    {
        const result = this.getController(event.request);

        if (result !== undefined) {
            event.controller = () => result.action.apply(result.action, this.getParameters(result.routeArgs));
        }
    }

    addController(route: RegExp, controller: Controller, action: string): void
    {
        this.controllers.push({
            "route": route,
            "controller": controller,
            "action": action
        });
    }

    protected getController(request: IncomingMessage): undefined | {action: Function, routeArgs: {[key: string]: string}}
    {
        let match, routeDefinition;
        for (let it = this.controllers.length - 1; it >= 0; --it) {
            routeDefinition = this.controllers[it];
            match = request.url !== undefined && routeDefinition.route.exec(request.url);
            if (match) {
                return {
                    "action": (routeDefinition.controller as any)[routeDefinition.action],
                    "routeArgs": match === true ? {} : (match.groups || {})
                };
            }
        }

        return undefined;
    }

    addParamConverter(paramConverter: ParamConverter): void
    {
        this.converters.push(paramConverter);
    }

    protected getParameters(routeArgs: {[key: string]: any}): any[]
    {
        let inject, args: any[] = [];

        for (let name of Object.keys(routeArgs || {})) {
            for (let it = this.converters.length - 1; it >= 0; --it) {
                if (this.converters[it].supports(name)) {
                    inject = this.converters[it].convert(name, routeArgs[name]);
                    args.splice(inject.position, 1, inject.value);
                }
            }
        }

        return args;
    }
}

module.exports = ControllerResolver;
