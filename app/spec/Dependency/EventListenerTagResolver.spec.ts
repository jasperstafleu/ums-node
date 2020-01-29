import EventListenerTagResolver from "$stafleu/Dependency/EventListenerTagResolver";
import {Mock} from "ts-mocks";
import Logger from "$stafleu/Logger/Logger";
import Container from "$stafleu/Dependency/Container";
import {EventEmitter} from "events";

describe('EventListenerTagResolver', () => {
    let logger: Mock<Logger>,
        resolver: EventListenerTagResolver;

    beforeEach(() => {
        logger = new Mock<Logger>({notice() {}});
        resolver = new EventListenerTagResolver(logger.Object);
    });

    describe('\b.resolve', () => {
        let container: Mock<Container>, serviceName: string;

        beforeEach(() => {
            container = new Mock<Container>({decorate() {}});
            serviceName = Math.random().toString();
        });

        it('should log a notice if tag had no method', () => {
            const tag = {name: Math.random().toString(), event: Math.random().toString()};

            logger.extend({
                notice(message) {
                    expect(message).toContain(tag.name);
                    expect(message).toContain(serviceName);
                }
            });

            resolver.resolve(container.Object, serviceName, tag);

            expect(logger.Object.notice).toHaveBeenCalledTimes(1);
            expect(container.Object.decorate).toHaveBeenCalledTimes(0);
        });

        it('should log a notice if tag had no event', () => {
            const tag = {name: Math.random().toString(), method: Math.random().toString()};

            logger.extend({
                notice(message) {
                    expect(message).toContain(tag.name);
                    expect(message).toContain(serviceName);
                }
            });

            resolver.resolve(container.Object, serviceName, tag);

            expect(logger.Object.notice).toHaveBeenCalledTimes(1);
            expect(container.Object.decorate).toHaveBeenCalledTimes(0);
        });

        it('should decorate the container by calling on on the event emitter', () => {
            class Listener { method() {} }

            const tag = {name: Math.random().toString(), event: Math.random().toString(), method: "method"},
                emitter = new Mock<EventEmitter>(),
                args = [Math.random()],
                listener = new Mock<Listener>();

            container.extend({
                decorate(sn: string, cb: (service: any) => void) {
                    expect(sn).toBe('event.emitter');
                    cb(emitter.Object);
                },
                get(sn) {
                    expect(sn).toBe(serviceName);
                    return listener.Object;
                }
            });

            emitter.extend({
                on(event: string, listener: (...args: any[]) => void) {
                    expect(event).toEqual(tag.event);
                    listener(...args);

                    return emitter.Object;
                }
            });

            listener.extend({
                method() {
                    expect([...arguments]).toEqual(args);
                }
            });

            resolver.resolve(container.Object, serviceName, tag);

            expect(logger.Object.notice).toHaveBeenCalledTimes(0);
            expect(listener.Object.method).toHaveBeenCalledTimes(1);
        });
    });
});
