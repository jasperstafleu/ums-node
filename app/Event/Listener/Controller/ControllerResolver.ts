'use strict';

import {ControllerEvent} from "../../Event/ControllerEvent";
import {Container} from "../../../Dependency/Container";

module.exports = class ControllerResolver
{
    protected container: Container;

    constructor(container: Container)
    {
        this.container = container;
    }

    handle(event: ControllerEvent): void
    {
        event.controller = (...args) => {
            let controller = this.container.get('controller.main');
            return controller['index'].apply(controller, args);
        }
    }
};
