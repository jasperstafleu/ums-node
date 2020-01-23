'use strict';

import {IncomingMessage} from "http";

export class KernelEvent
{
    readonly request: IncomingMessage;

    constructor(request: IncomingMessage)
    {
        this.request = request;
    }
}
