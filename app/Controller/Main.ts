'use strict';

import {IncomingMessage} from "http";
import {HttpResponse} from "../Component/HttpResponse";

module.exports = class Main
{
    index(name: string = 'world'): HttpResponse
    {
        return new HttpResponse(`Hello ${name}`);
        // return new HttpResponse(`Hello ${name}, at ${request.url}`);
    }
};
