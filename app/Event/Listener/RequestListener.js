'use strict';

module.exports = class RequestListener
{
    handle(event)
    {
        const response = event.response;

        response.statusCode = 200;
        response.setHeader('Content-Type', 'text/plain');
        response.end('Hello from event ' + (process.env.GREETING || 'world'));
    }
};
