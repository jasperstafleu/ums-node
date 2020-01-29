import Logger from "$stafleu/Logger/Logger";
import {Mock} from "ts-mocks";
import ControllerTagResolver from "$stafleu/Dependency/ControllerTagResolver";
import Container from "$stafleu/Dependency/Container";
import ControllerResolver from "$stafleu/Event/Listener/Controller/ControllerResolver";
import Controller from "$stafleu/Controller/Controller";

describe("ControllerTagResolver", () => {
    let logger: Mock<Logger>,
        resolver: ControllerTagResolver;

    beforeEach(() => {
        logger = new Mock<Logger>({notice: () => {}});
        resolver = new ControllerTagResolver(logger.Object);
    });

    describe('\b.resolve', () => {
        let container: Mock<Container>;

        beforeEach(() => {
            container = new Mock<Container>({decorate: () => {}});
        });

        it('should log a notice if tag had no action', () => {
            const serviceName = Math.random().toString(),
                tag = {name: Math.random().toString(), route: Math.random().toString()};

            logger.extend({
                notice: (message) => {
                    expect(message).toContain(tag.name);
                    expect(message).toContain(serviceName);
                }
            });

            resolver.resolve(container.Object, serviceName, tag);

            expect(logger.Object.notice).toHaveBeenCalledTimes(1);
            expect(container.Object.decorate).toHaveBeenCalledTimes(0);
        });

        it('should log a notice if tag had no route', () => {
            const serviceName = Math.random().toString(),
                tag = {name: Math.random().toString(), action: Math.random().toString()};

            logger.extend({
                notice: (message) => {
                    expect(message).toContain(tag.name);
                    expect(message).toContain(serviceName);
                }
            });

            resolver.resolve(container.Object, serviceName, tag);

            expect(logger.Object.notice).toHaveBeenCalledTimes(1);
            expect(container.Object.decorate).toHaveBeenCalledTimes(0);
        });

        it('should decorate the container by calling addController on the resolver', () => {
            const serviceName = Math.random().toString(),
                tag = {name: Math.random().toString(), action: Math.random().toString(), route: Math.random().toString()},
                controllerResolver = new Mock<ControllerResolver>(),
                controller = new Mock<Controller>();

            container.extend({
                decorate(sn: string, cb: (service: any) => void) {
                    expect(sn).toBe('event.controller_resolver');
                    cb(controllerResolver.Object);
                },
                get: (sn) => {
                    expect(sn).toBe(serviceName);
                    return controller.Object;
                }
            });

            controllerResolver.extend({
                addController(route: string, contr: Controller, action: string, defs) {
                    expect(route).toBe(tag.route);
                    expect(contr).toBe(controller.Object);
                    expect(action).toBe(tag.action);
                    expect(defs).toEqual({});
                }
            });

            resolver.resolve(container.Object, serviceName, tag);

            expect(logger.Object.notice).toHaveBeenCalledTimes(0);
            expect(controllerResolver.Object.addController).toHaveBeenCalledTimes(1);
        });
    });
});
