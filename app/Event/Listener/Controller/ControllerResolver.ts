'use strict';

import {ControllerEvent} from "../../Event/ControllerEvent";
import {Controller} from "../../../Controller/Controller";
import {IncomingMessage} from "http";
import {ParamConverter} from "../../../Component/ParamConverter";

module.exports = class ControllerResolver
{
    protected controllerStack: Function = (request: IncomingMessage) => undefined;
    protected converters: ParamConverter[] = [];

    handle(event: ControllerEvent): void
    {
        const result = this.controllerStack(event.request);
        if (result === undefined) {
            return;
        }

        const [controller, action, routeArgs] = result;

        event.controller = (...args) => {
            for (let name of Object.keys(routeArgs || {})) {
                for (let it = this.converters.length - 1; it >= 0; --it) {
                    if (this.converters[it].supports(name)) {
                        const inject = this.converters[it].convert(name, routeArgs[name]);
                        args.splice(inject.position, 1, inject.value);
                    }
                }
            }
            return controller[action].call(controller, ...args)
        };
    }

    addController(route: RegExp, controller: Controller, action: string): Function
    {
        let stack = this.controllerStack;

        return this.controllerStack = (request: IncomingMessage) => {
            let match = route.exec(request.url);

            if (!match) {
                // No match? Next candidate
                return stack(request);
            }

            return [controller, action, match.groups];
        };
    }

    addParamConverter(paramConverter: ParamConverter): void
    {
        this.converters.push(paramConverter);
    }
};
