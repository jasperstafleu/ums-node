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
        event.controller = this.container.get('controller.main')['index'];
    }
};
