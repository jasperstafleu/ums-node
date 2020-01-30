import ControllerResolver from "$stafleu/Event/Listener/Controller/ControllerResolver";
import ControllerEvent from "$stafleu/Event/Event/ControllerEvent";
import {Mock} from "ts-mocks";
import {IncomingMessage} from "http";
import Controller from "$stafleu/Controller/Controller";
import Spy = jasmine.Spy;
import ParamConverter from "$stafleu/Component/ParamConverter";

describe('ControllerResolver', () => {
    let resolver: ControllerResolver;

    beforeEach(() => {
        resolver = new ControllerResolver();
    });

    describe('\b.handle', () => {
        let request: Mock<IncomingMessage>,
            event: ControllerEvent,
            route: string,
            controller: Mock<Controller>,
            action: string,
            actionSpy: Spy;

        beforeEach(() => {
            request = new Mock<IncomingMessage>();
            event = new ControllerEvent(request.Object);
            action = Math.random().toString(36);
            actionSpy = jasmine.createSpy('action');
            route = Math.random().toString(36);

            const controllerMethods = {};
            (controllerMethods as any)[action] = actionSpy;
            controller = new Mock<Controller>(controllerMethods);
        });

        describe('action resolution', () => {
            beforeEach(() => {
                request.Object.url = route;
            });

            const assertCorrectController = () => {
                resolver.handle(event);

                expect(actionSpy).toHaveBeenCalledTimes(0); // controller's action should not have been yet

                expect(event.controller).toBeInstanceOf(Function);
                (event.controller as Function)();

                expect(actionSpy).toHaveBeenCalledTimes(1); // But when the controller is called, it should proxy to the action
            };

            it('should keep event.controller empty when no matching controller can be found', () => {
                resolver.handle(event);
                expect(event.controller).toBe(undefined);
            });

            it('should retrieve the matching controller for the url', () => {
                resolver.addController(route, controller.Object, action);
                assertCorrectController();
            });

            it('should retrieve the last matching controller for the url if multiple matches exist', () => {
                resolver.addController(route, controller.Object, ''); // action not defined on controller: should raise error if called
                resolver.addController(route, controller.Object, action);
                assertCorrectController();
            });

            it('should ignore routes that over-match the action', () => {
                resolver.addController(route + 'some additional string', controller.Object, action);
                expect(event.controller).toBe(undefined);
            });

            it('should match partially matching controller', () => {
                resolver.addController(route.substr(0, route.length - 2), controller.Object, action);
                assertCorrectController();
            });

            it('should match controller regexp based', () => {
                resolver.addController('^.*$', controller.Object, action);
                assertCorrectController();
            });

            it('should ignore non-matching controller but handle matching one', () => {
                resolver.addController(route + 'non-matching 1', controller.Object, '');
                resolver.addController(route, controller.Object, action);
                resolver.addController(route + 'non-matching 2', controller.Object, '');
                assertCorrectController();
            });
        });

        // TODO: If I have two test suites, I probably have two responsibilities as well, and should therefore split the class
        describe('arguments resolution', () => {
            const sConverter: ParamConverter = {
                    supports(name: string): boolean {
                        return name.charAt(0) === 's';
                    },
                    convert(name: string, value: string): { position: number; value: any } {
                        return {
                            position: parseInt(name.substr(1)),
                            value: value
                        };
                    }
                },
                getResolvedArguments = (route: string, defaults: {} = {}): any[] => {
                    let resolvedArguments: any[] | undefined = undefined;

                    actionSpy.and.callFake((...args) => {
                        resolvedArguments = args;
                    });

                    request.Object.url = Math.random().toString(36);
                    resolver.addController(route, controller.Object, action, defaults);
                    resolver.handle(event);
                    (event.controller as Function)();

                    if (resolvedArguments === undefined) {
                        throw Error('resolved arguments still not resolved???');
                    }

                    return resolvedArguments;
                };

            beforeEach(() => {
                resolver.addParamConverter(sConverter);
            });

            it('should inject no parameters if non exist', () => {
                expect(getResolvedArguments('^.*$', {})).toEqual([]);
            });

            it('should inject route parameters at proper position', () => {
                expect(getResolvedArguments('^(?<s0>.*)$')).toEqual([request.Object.url]);
            });

            it('should inject default parameters at proper positions', () => {
                const param = Math.random().toString(36);
                expect(getResolvedArguments('^.*$', {'s0': param})).toEqual([param]);
            });

            it('should handle route and default parameters both if not conflicting position', () => {
                const param = Math.random();
                expect(getResolvedArguments('^(?<s0>.*)$', {'s1': param})).toEqual([request.Object.url, param]);
            });

            it('should prefer route over default parameters if conflicting position', () => {
                const param = Math.random().toString(36);
                expect(getResolvedArguments('^(?<s0>.*)$', {'s0': param})).toEqual([request.Object.url]);
            });

            it('should set gaps in parameters to undefined', () => {
                const param = Math.random().toString(36);
                expect(getResolvedArguments('^..(?<s3>..).*$', {'s1': param}))
                    .toEqual([undefined, param, undefined, (request.Object.url as string).substr(2, 2)]);
            });

            it('should ignore non-supported parameters', () => {
                const param = Math.random().toString(36);
                expect(getResolvedArguments('^(?<noSupport1>.*)$', {'noSupport0': param})).toEqual([]);
            });

            it('should support multiple parameter type converters', () => {
                const param = Math.random().toString(36);

                resolver.addParamConverter({
                    supports(name: string): boolean {
                        return name.charAt(0) === 't';
                    },
                    convert(name: string): { position: number; value: any } {
                        return {
                            position: parseInt(name.substr(1)),
                            value: true
                        };
                    }
                });

                expect(getResolvedArguments('^(?<t0>.*)$', {'s1': param})).toEqual([true, param]);
            });

            it('should prefer conversion by later over earlier converters if both support', () => {
                const param = Math.random().toString(36);

                spyOn(sConverter, 'supports');
                spyOn(sConverter, 'convert');

                resolver.addParamConverter({
                    supports(name: string): boolean {
                        return name.charAt(0) === 's';
                    },
                    convert(name: string, value: string): { position: number; value: any } {
                        return {
                            position: parseInt(name.substr(1)),
                            value: value + ' later'
                        };
                    }
                });

                expect(getResolvedArguments('^.*$', {'s0': param})).toEqual([param+' later']);
                expect(sConverter.supports).toHaveBeenCalledTimes(0);
                expect(sConverter.convert).toHaveBeenCalledTimes(0);
            });
        });
    });
});
