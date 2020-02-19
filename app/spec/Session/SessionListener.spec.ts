import SessionListener from "$stafleu/Session/SessionListener";
import SessionBag from "$stafleu/Session/Bag/SessionBag";
import {Mock} from "ts-mocks";
import {ResponseEvent, RequestEvent} from "$stafleu/Event/Event/KernelEvent";
import HttpResponse from "$stafleu/Component/HttpResponse";
import HttpRequest from "$stafleu/Component/HttpRequest";

describe('SessionListener', () => {
    let listener: SessionListener,
        bag: Mock<SessionBag>,
        sessionName: string,
        sessionTtl: number,
        cookiePath: string
    ;

    beforeEach(() => {
        bag = new Mock<SessionBag>();
        sessionName = Math.random().toString(36);
        sessionTtl = Math.floor(Math.random() * 1e4) + 1000;
        cookiePath = Math.random().toString(36);
        listener = new SessionListener(bag.Object, sessionName, sessionTtl, cookiePath);
    });

    describe('\b.setSessionIdFromHeader', () => {
        let sessionId: string,
            event: Mock<RequestEvent>,
            request: Mock<HttpRequest>;

        beforeEach(() => {
            sessionId = Math.random().toString(36);
            request = new Mock<HttpRequest>();
            event = new Mock<RequestEvent>({
                request: request.Object
            });
            bag.extend({setId() {}});
        });

        it('should not set the id if no cookie headers are available', () => {
            request.extend({
                getCookie() { return undefined; }
            });

            listener.setSessionIdFromHeader(event.Object);

            expect(bag.Object.setId).not.toHaveBeenCalled();
        });

        it('should pass the sessionId based on sessionName and pass it to the bag', () => {
            request.extend({
                getCookie(cookieName) { return cookieName === sessionName ? sessionId : undefined; }
            });

            listener.setSessionIdFromHeader(event.Object);

            expect(bag.Object.setId).toHaveBeenCalledWith(sessionId);
        })
    });

    describe('\b.addSessionCookie', () => {
        let event: Mock<ResponseEvent>,
            request: Mock<HttpRequest>,
            response: Mock<HttpResponse>;

        beforeEach(() => {
            request = new Mock<HttpRequest>();
            response = new Mock<HttpResponse>({
                headers: {},
                addHeader() { return response.Object; }
            });
            event = new Mock<ResponseEvent>({
                request: request.Object,
                response: response.Object
            });
        });

        it('should not add sessionId cookie if the bag does not exist', () => {
            bag.extend({
                exists() { return false; },
            });

            listener.addSessionCookie(event.Object);

            expect(response.Object.addHeader).not.toHaveBeenCalled();
            expect(response.Object.headers['Set-Cookie']).toBeUndefined();
        });

        it('should not add sessionId cookie if the sessionId is equal to the received one', () => {
            const reqEvent = new Mock<RequestEvent>({
                    request: request.Object
                }),
                sessId = Math.random().toString(36);

            bag.extend({
                exists() { return true; },
                getId() { return sessId; },
                setId() { }
            });

            request.extend({
                getCookie() { return sessId; }
            });

            listener.setSessionIdFromHeader(reqEvent.Object);
            listener.addSessionCookie(event.Object);

            expect(response.Object.headers['Set-Cookie']).toBeUndefined();
        });

        it('should add sessionId from bag as Set-Cookie header to response', () => {
            const sessionId = Math.random().toString(36);

            bag.extend({
                exists() { return true; },
                getId() { return sessionId; }
            });

            listener.addSessionCookie(event.Object);

            expect(response.Object.addHeader).toHaveBeenCalledWith('Set-Cookie', {
                asymmetricMatch(actual: string) {
                    expect(actual).toMatch(new RegExp(`\^${sessionName}=${sessionId}`));
                    expect(actual).toContain('HttpOnly');
                    expect(actual).toContain('Path='+cookiePath);
                    expect(actual).toContain('Max-Age='+sessionTtl);

                    return true;
                }
            });
        });

        it('should not include Max-Age or Expires if sessionTtl <= 0', () => {
            const sessionId = Math.random().toString(36);

            listener = new SessionListener(bag.Object, sessionName, 0, cookiePath);

            bag.extend({
                exists() { return true; },
                getId() { return sessionId; }
            });

            listener.addSessionCookie(event.Object);

            expect(response.Object.addHeader).toHaveBeenCalledWith('Set-Cookie', {
                asymmetricMatch(actual: string) {
                    expect(actual).toMatch(new RegExp(`\^${sessionName}=${sessionId}`));
                    expect(actual).toContain('HttpOnly');
                    expect(actual).toContain('Path='+cookiePath);
                    expect(actual).not.toContain('Max-Age=');
                    expect(actual).not.toContain('Expires=');

                    return true;
                }
            });
        });
    });

    describe('\b.resetSessionId', () => {
        it('should pass a reset to the session bag', () => {
            bag.extend({reset() {}});

            listener.resetSessionId();

            expect(bag.Object.reset).toHaveBeenCalled();
        });
    });
});
