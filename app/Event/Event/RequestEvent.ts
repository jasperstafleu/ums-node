'use strict';

import {IncomingMessage, ServerResponse} from "http";

export class RequestEvent
{
    readonly request: IncomingMessage;
    readonly response: ServerResponse;

    constructor(request: IncomingMessage, response: ServerResponse)
    {
        this.request = request;
        this.response = response;
    }
}
