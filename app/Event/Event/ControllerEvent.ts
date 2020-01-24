'use strict';

import {KernelEvent} from "./KernelEvent";

export class ControllerEvent extends KernelEvent
{
    controller: Function;

    get hasController(): boolean { return this.controller !== undefined; }
}
