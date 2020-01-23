'use strict';

import {EventEmitter} from 'events';
import {IncomingMessage, ServerResponse} from 'http';
import {RequestEvent} from "./Event/Event/RequestEvent";

module.exports = class Kernel
{
    private emitter: EventEmitter;
    private resolver;

    constructor(emitter: EventEmitter, resolver)
    {
        this.emitter = emitter;
        this.resolver = resolver;
    }

    handle(request: IncomingMessage, response: ServerResponse)
    {
        this.emitter.emit('kernel.request', new RequestEvent(request, response));
    }
};
