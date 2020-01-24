'use strict';

import {KernelEvent} from "./KernelEvent";
import {HttpResponse} from "../../Component/HttpResponse";
import {IncomingMessage} from "http";

export class ResponseEvent extends KernelEvent
{
    response: HttpResponse;

    constructor(request: IncomingMessage, response: HttpResponse)
    {
        super(request);
        this.response = response;
    }
}