import {EventEmitter} from 'events';
import {IncomingMessage, ServerResponse} from 'http';
import {RequestEvent} from "../Event/Event/RequestEvent";
import {ResponseEvent} from "../Event/Event/ResponseEvent";
import {HttpResponse} from "./HttpResponse";
import {FinishRequestEvent} from "../Event/Event/FinishRequestEvent";
import {ControllerEvent} from "../Event/Event/ControllerEvent";

module.exports = class Kernel
{
    protected emitter: EventEmitter;

    constructor(emitter: EventEmitter)
    {
        this.emitter = emitter;
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

    protected handleRaw(request: IncomingMessage): HttpResponse
    {
        const requestEvent = new RequestEvent(request);
        this.emitter.emit('kernel.request', requestEvent);

        if (requestEvent.response) {
            return this.filterResponse(request, requestEvent.response);
        }

        const controllerEvent = new ControllerEvent(request);
        this.emitter.emit('kernel.controller', controllerEvent);

        if (!controllerEvent.controller) {
            throw new Error('Unable to find controller for path');
        }

        return this.filterResponse(request, controllerEvent.controller());
    }

    protected filterResponse(request: IncomingMessage, response: HttpResponse): HttpResponse
    {
        let event = new ResponseEvent(request, response);

        this.emitter.emit('kernel.response', event);
        this.finishRequest(request);

        return event.response;
    }

    protected finishRequest(request: IncomingMessage): void
    {
        this.emitter.emit('kernel.finish_request', new FinishRequestEvent(request));
    }

    protected handleThrowable(e: Error, request: IncomingMessage): HttpResponse
    {
        // TODO: Event driven exception handling
        return new HttpResponse(`${e.stack}`, 500, {'Content-type':'text/plain'});
    }
};
