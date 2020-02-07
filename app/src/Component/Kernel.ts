import {EventEmitter} from 'events';
import {IncomingMessage, ServerResponse} from 'http';
import HttpResponse from "$stafleu/Component/HttpResponse";
import {ControllerEvent, ErrorEvent, FinishRequestEvent, RequestEvent, ResponseEvent, TerminateEvent, ViewEvent} from "$stafleu/Event/Event/KernelEvent";
import MissingController from "$stafleu/Error/MissingController";
import ControllerDoesNotReturnResponse from "$stafleu/Error/ControllerDoesNotReturnResponse";

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

        this.emitter.emit('kernel.terminate', new TerminateEvent(request, httpResponse));
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

        const controllerResult = controllerEvent.controller();
        if (controllerResult instanceof HttpResponse) {
            return this.filterResponse(request, controllerResult);
        }

        const viewEvent = new ViewEvent(request, controllerResult);
        this.emitter.emit('kernel.view', viewEvent);

        if (viewEvent.response instanceof HttpResponse) {
            return this.filterResponse(request, viewEvent.response);
        }

        throw new ControllerDoesNotReturnResponse();
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
        const event = new ErrorEvent(request, e);
        this.emitter.emit('kernel.error', event);

        const response = event.response || new HttpResponse(`${e.constructor.name} ${e.stack}`, 500);

        try {
            return this.filterResponse(request, response);
        } catch (e) {
            // If even filterResponse throws an Error, give up and just use the "safe" response instead.
            return response;
        }
    }
}
