'use strict';

import {IncomingMessage} from "http";
import {HttpResponse} from "../Component/HttpResponse";

module.exports = class Main
{
    index(request: IncomingMessage): HttpResponse
    {
        return new HttpResponse('Hello world from controller');
    }
};
