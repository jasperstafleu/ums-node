import {EventEmitter} from 'events';
import {IncomingMessage, ServerResponse} from "http";
import Kernel from "$stafleu/Component/Kernel";
import {Mock} from "ts-mocks";
import HttpResponse from "$stafleu/Component/HttpResponse";
import {default as KernelEvent, ControllerEvent, FinishRequestEvent, RequestEvent, ResponseEvent, TerminateEvent, ViewEvent} from "$stafleu/Event/Event/KernelEvent";

describe('Kernel.handle', () => {
    let kernel: Kernel,
        emitter: Mock<EventEmitter>,
        request: Mock<IncomingMessage>,
        response: Mock<ServerResponse>;

    beforeEach(() => {
        emitter = new Mock<EventEmitter>();
        request = new Mock<IncomingMessage>();
        response = new Mock<ServerResponse>({
            setHeader(): void {}
        });
        kernel = new Kernel(emitter.Object);
    });

    it('should use response from request event if one is available', () => {
        const expectedResponse = new HttpResponse(
            Math.random().toString(),
            Math.random(),
            { // This is a bit of a side-effect, but this test also tests setting the headers on the response
                "X-one": Math.random().toString(),
                "X-two": Math.random().toString()
            }
        );

        emitter.extend({
            emit(eventName: string, event: KernelEvent): boolean {
                if (eventName === 'kernel.request' && event instanceof RequestEvent) {
                    event.response = expectedResponse;
                } else if (eventName === 'kernel.response' && event instanceof ResponseEvent) {
                } else if (eventName === 'kernel.finish_request' && event instanceof FinishRequestEvent) {
                } else if (eventName === 'kernel.terminate' && event instanceof TerminateEvent) {
                } else {
                    fail(`Event name '${eventName}' and type of event '${event.constructor.name}' do not match`);
                }

                return true;
            }
        });

        response.extend({
            setHeader(name: string, value: number | string | string[]): void {
                if (name === 'X-one') {
                    expect(name + ': ' + value).toBe('X-one: '+expectedResponse.headers["X-one"]);
                } else {
                    expect(name + ': ' + value).toBe('X-two: '+expectedResponse.headers["X-two"]);
                }
            },
            end(): void {
                expect(arguments[0]).toBe(expectedResponse.content);
            }
        });

        kernel.handle(request.Object, response.Object);

        expect(response.Object.statusCode).toBe(expectedResponse.httpCode);
        expect(response.Object.setHeader).toHaveBeenCalledTimes(2);
        expect(emitter.Object.emit).toHaveBeenCalledTimes(4);
    });

    it('should display MissingController if no controller can be found', () => {
        emitter.extend({
            emit(eventName: string, event: KernelEvent): boolean {
                if (eventName === 'kernel.request' && event instanceof RequestEvent) {
                } else if (eventName === 'kernel.controller' && event instanceof ControllerEvent) {
                } else if (eventName === 'kernel.response' && event instanceof ResponseEvent) {
                } else if (eventName === 'kernel.finish_request' && event instanceof FinishRequestEvent) {
                } else if (eventName === 'kernel.terminate' && event instanceof TerminateEvent) {
                } else {
                    fail(`Event name '${eventName}' and type of event '${event.constructor.name}' do not match`);
                }

                return true;
            }
        });

        response.extend({
            setHeader(name: string, value: number | string | string[]): void {
                expect(name + ': ' + value).toBe('Content-Type: text/plain');
            },
            end(): void {
                expect(arguments[0]).toContain('MissingController');
            }
        });

        kernel.handle(request.Object, response.Object);

        expect(response.Object.statusCode).toBe(500);
        expect(response.Object.setHeader).toHaveBeenCalledTimes(1);
        expect(emitter.Object.emit).toHaveBeenCalledTimes(5);
    });

    it('should use response from controller call if request event has no response', () => {
        const expectedResponse = new HttpResponse(Math.random().toString(), Math.random(), {});

        emitter.extend({
            emit(eventName: string, event: KernelEvent): boolean {
                if (eventName === 'kernel.request' && event instanceof RequestEvent) {
                } else if (eventName === 'kernel.controller' && event instanceof ControllerEvent) {
                    event.controller = () => expectedResponse;
                } else if (eventName === 'kernel.response' && event instanceof ResponseEvent) {
                } else if (eventName === 'kernel.finish_request' && event instanceof FinishRequestEvent) {
                } else if (eventName === 'kernel.terminate' && event instanceof TerminateEvent) {
                } else {
                    fail(`Event name '${eventName}' and type of event '${event.constructor.name}' do not match`);
                }

                return true;
            }
        });

        response.extend({
            end(): void {
                expect(arguments[0]).toContain(expectedResponse.content);
            }
        });

        kernel.handle(request.Object, response.Object);

        expect(response.Object.statusCode).toBe(expectedResponse.httpCode);
        expect(response.Object.setHeader).toHaveBeenCalledTimes(0);
        expect(emitter.Object.emit).toHaveBeenCalledTimes(5);
    });

    it('should recover nicely if filterResponse throws error', () => {
        const e = new Error(Math.random().toString());

        emitter.extend({
            emit(eventName: string, event: KernelEvent): boolean {
                if (eventName === 'kernel.request' && event instanceof RequestEvent) {
                    event.response = new HttpResponse();
                } else if (eventName === 'kernel.response' && event instanceof ResponseEvent) {
                    throw e;
                } else if (eventName === 'kernel.terminate' && event instanceof TerminateEvent) {
                } else {
                    fail(`Event name '${eventName}' and type of event '${event.constructor.name}' do not match`);
                }

                return true;
            }
        });

        response.extend({
            end(): void {
                expect(arguments[0]).toContain(e.message);
            }
        });

        kernel.handle(request.Object, response.Object);

        expect(response.Object.statusCode).toBe(500);
        expect(response.Object.setHeader).toHaveBeenCalledTimes(1);
        expect(emitter.Object.emit).toHaveBeenCalledTimes(4); // request, response, response
    });

    it('should raise ViewEvent iff controller result is not a Response object, and use the Response of the event as actual response', () => {
        const expectedResponse = new HttpResponse(Math.random().toString(), Math.random(), {}),
            controllerResult = new Date;

        emitter.extend({
            emit(eventName: string, event: KernelEvent): boolean {
                if (eventName === 'kernel.request' && event instanceof RequestEvent) {
                } else if (eventName === 'kernel.controller' && event instanceof ControllerEvent) {
                    event.controller = () => controllerResult;
                } else if (eventName === 'kernel.response' && event instanceof ResponseEvent) {
                } else if (eventName === 'kernel.view' && event instanceof ViewEvent) {
                    expect(event.controllerResult).toBe(controllerResult);
                    event.response = expectedResponse;
                } else if (eventName === 'kernel.finish_request' && event instanceof FinishRequestEvent) {
                } else if (eventName === 'kernel.terminate' && event instanceof TerminateEvent) {
                } else {
                    fail(`Event name '${eventName}' and type of event '${event.constructor.name}' do not match`);
                }

                return true;
            }
        });

        response.extend({
            end(): void {
                expect(arguments[0]).toContain(expectedResponse.content);
            }
        });

        kernel.handle(request.Object, response.Object);

        expect(response.Object.statusCode).toBe(expectedResponse.httpCode);
        expect(response.Object.setHeader).toHaveBeenCalledTimes(0);
        expect(emitter.Object.emit).toHaveBeenCalledTimes(6);
    });

    it('should throw ControllerDoesNotReturnResponse if even the ViewEvent does not hold HttpResponse', () => {
        const controllerResult = new Date;

        emitter.extend({
            emit(eventName: string, event: KernelEvent): boolean {
                if (eventName === 'kernel.request' && event instanceof RequestEvent) {
                } else if (eventName === 'kernel.controller' && event instanceof ControllerEvent) {
                    event.controller = () => controllerResult;
                } else if (eventName === 'kernel.response' && event instanceof ResponseEvent) {
                } else if (eventName === 'kernel.view' && event instanceof ViewEvent) {
                    expect(event.controllerResult).toBe(controllerResult);
                } else if (eventName === 'kernel.finish_request' && event instanceof FinishRequestEvent) {
                } else if (eventName === 'kernel.terminate' && event instanceof TerminateEvent) {
                } else {
                    fail(`Event name '${eventName}' and type of event '${event.constructor.name}' do not match`);
                }

                return true;
            }
        });

        response.extend({
            end(): void {
                expect(arguments[0]).toContain('ControllerDoesNotReturnResponse');
            }
        });

        kernel.handle(request.Object, response.Object);

        expect(response.Object.statusCode).toBe(500);
        expect(response.Object.setHeader).toHaveBeenCalledTimes(1);
        expect(emitter.Object.emit).toHaveBeenCalledTimes(6);
    });
});

