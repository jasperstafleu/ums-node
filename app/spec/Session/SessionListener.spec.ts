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
        sessionTtl: number
    ;

    beforeEach(() => {
        bag = new Mock<SessionBag>();
        sessionName = Math.random().toString(36);
        sessionTtl = Math.floor(Math.random() * 1e4) + 1000;
        listener = new SessionListener(bag.Object, sessionName, sessionTtl);
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
                headers: {}
            });
            event = new Mock<ResponseEvent>({
                request: request.Object,
                response: response.Object
            });
        });

        it('should not add sessionId cookie if the bag has not changed', () => {
            bag.extend({
                exists() { return false; },
                getId() { return ''; }
            });

            listener.addSessionCookie(event.Object);

            expect(bag.Object.getId).not.toHaveBeenCalled();
            expect(response.Object.headers['Set-Cookie']).toBeUndefined();
        });

        it('should add sessionId from bag as Set-Cookie header to response', () => {
            const sessionId = Math.random().toString(36);

            bag.extend({
                exists() { return true; },
                getId() { return sessionId; }
            });

            listener.addSessionCookie(event.Object);

            const setCookie = response.Object.headers['Set-Cookie'];
            expect(setCookie).toMatch(new RegExp(`\^${sessionName}=${sessionId}`));
            expect(setCookie).toContain('HttpOnly');
            expect(setCookie).toContain('Expires=');

            const expectedExpiry = ((new Date).getTime() / 1000) + sessionTtl,
                actualExpiry = (new Date((setCookie.toString().match(/(?<=Expires=).+?(?=;|$)/) || '').toString())).getTime() / 1000;
            expect(expectedExpiry - actualExpiry).toBeLessThan(10);         // Up to 10 second difference between
            expect(expectedExpiry - actualExpiry).toBeGreaterThan(-10);     // expected and actual is accepted
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
