import {RequestEvent, ResponseEvent} from "$stafleu/Event/Event/KernelEvent";
import SessionBag from "$stafleu/Session/Bag/SessionBag";

export default class SessionListener
{
    constructor(protected bag: SessionBag, readonly sessionName: string, protected sessionTtl: number = 30*60)
    {
    }

    setSessionIdFromHeader(event: RequestEvent): void
    {
        const sessionId = event.request.getCookie(this.sessionName);
        if (sessionId) {
            this.bag.setId(sessionId);
        }
    }

    addSessionCookie(event: ResponseEvent): void
    {
        // No response determined or session cookie has already been set? Do nothing.
        if (!this.bag.exists()) {
            return;
        }

        const expire = new Date();
        expire.setSeconds(expire.getSeconds() + this.sessionTtl);

        // TODO: If HTTPS: "Secure"
        // TODO: Make sure this does not conflict with other cookie setters. This should probably be fixed in the HttpResponse object...
        event.response.headers['Set-Cookie'] = `${this.sessionName}=${this.bag.getId()}; HttpOnly; Expires=${expire.toUTCString()}`;
    }

    resetSessionId()
    {
        this.bag.reset();
    }
}

