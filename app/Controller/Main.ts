'use strict';

import {IncomingMessage} from "http";
import {HttpResponse} from "../Component/HttpResponse";

module.exports = class Main
{
    private who: string;

    constructor(who: string)
    {
        this.who = who;
    }

    index(request: IncomingMessage): HttpResponse
    {
        return new HttpResponse('Hello ' + this.who);
    }
};
