'use strict';

import {KernelEvent} from "./KernelEvent";

export class ControllerEvent extends KernelEvent
{
    controller?: Function;
}
