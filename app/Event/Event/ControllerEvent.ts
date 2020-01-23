'use strict';

import {KernelEvent} from "./KernelEvent";

export class ControllerEvent extends KernelEvent
{
    controller: any;

    get hasController(): boolean { return this.controller !== undefined; }
}
