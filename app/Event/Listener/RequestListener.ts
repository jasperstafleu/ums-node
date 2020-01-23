'use strict';

import {RequestEvent} from "../Event/RequestEvent";

module.exports = class RequestListener
{
    handle(event: RequestEvent): void
    {
        const response = event.response;

        response.statusCode = 200;
        response.setHeader('Content-Type', 'text/plain');
        response.end('Hello world');
    }
};
