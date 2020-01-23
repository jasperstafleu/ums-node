'use strict';

import {EventEmitter} from 'events';
import {IncomingMessage, ServerResponse} from 'http';
import {RequestEvent} from "./Event/Event/RequestEvent";
import {ResponseEvent} from "./Event/Event/ResponseEvent";
import {HttpResponse} from "./Component/HttpResponse";
import {FinishRequestEvent} from "./Event/Event/FinishRequestEvent";

module.exports = class Kernel
{
    private emitter: EventEmitter;
    private resolver;

    constructor(emitter: EventEmitter, resolver)
    {
        this.emitter = emitter;
        this.resolver = resolver;
    }

    handle(request: IncomingMessage, response: ServerResponse): void
    {
        let httpResponse;
        try {
            httpResponse = this.handleRaw(request);
        } catch (e) {
            httpResponse = this.handleThrowable(e, request)
        }

        response.statusCode = httpResponse.httpCode;
        for (let name of Object.keys(httpResponse.headers)) {
            response.setHeader(name, httpResponse.headers[name]);
        }
        response.end(httpResponse.content);
    }

    private handleRaw(request: IncomingMessage): HttpResponse
    {
        let event = new RequestEvent(request);
        this.emitter.emit('kernel.request', event);

        if (event.hasResponse) {
            return this.filterResponse(request, event.response);
        }
    }

    private filterResponse(request: IncomingMessage, response: HttpResponse): HttpResponse
    {
        let event = new ResponseEvent(request, response);

        this.emitter.emit('kernel.response', event);
        this.finishRequest(request);

        return event.response;
    }

    private finishRequest(request: IncomingMessage): void
    {
        this.emitter.emit('kernel.finish_request', new FinishRequestEvent(request));
    }

    private handleThrowable(e: Error, request: IncomingMessage): HttpResponse
    {
        // TODO: Event driven exception handling
        return new HttpResponse('Error detected', 500);
    }
};
