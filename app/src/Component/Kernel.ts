import {EventEmitter} from 'events';
import {IncomingMessage, ServerResponse} from 'http';
import RequestEvent from "$stafleu/Event/Event/RequestEvent";
import ResponseEvent from "$stafleu/Event/Event/ResponseEvent";
import HttpResponse from "$stafleu/Component/HttpResponse";
import FinishRequestEvent from "$stafleu/Event/Event/FinishRequestEvent";
import ControllerEvent from "$stafleu/Event/Event/ControllerEvent";
import MissingController from "$stafleu/Exception/MissingController";

export default class Kernel
{
    constructor(protected emitter: EventEmitter)
    {
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
            throw new MissingController('Unable to find controller for path');
        }

        return this.filterResponse(request, controllerEvent.controller());
    }

    protected filterResponse(request: IncomingMessage, response: HttpResponse): HttpResponse
    {
        const event = new ResponseEvent(request, response);

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
        // TODO: Dispatch exception event
        // TODO: Retrieve response from exception event and use it, immediatly going to finish request otherwise
        // TODO: Determine response code corresponding to exception (if any)
        let response = new HttpResponse(`${e.constructor.name} ${e.stack}`, 500, {'Content-type':'text/plain'});

        try {
            return this.filterResponse(request, response);
        } catch (e) {
            // If even filterResponse throws an Error, give up and just use the "safe" response instead.
            return response;
        }
    }
}
