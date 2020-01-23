'use strict';

import {IncomingMessage} from "http";
import {HttpResponse} from "../Component/HttpResponse";

module.exports = class Main
{
    index(name?: string): HttpResponse
    {
        name = name || 'you';
        return new HttpResponse(`Hello ${name}`);
        // return new HttpResponse(`Hello ${name}, at ${request.url}`);
    }
};
