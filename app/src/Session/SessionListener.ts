import {RequestEvent, ResponseEvent} from "$stafleu/Event/Event/KernelEvent";
import SessionBag from "$stafleu/Session/Bag/SessionBag";

export default class SessionListener
{
    private sessionId: string | undefined;

    constructor(protected bag: SessionBag, readonly sessionName: string, protected sessionTtl: number = 30*60)
    {
    }

    setSessionIdFromHeader(event: RequestEvent): void
    {
        this.sessionId = event.request.getCookie(this.sessionName);
        if (this.sessionId) {
            this.bag.setId(this.sessionId);
        }
    }

    addSessionCookie(event: ResponseEvent): void
    {
        // No response determined or session cookie has already been set? Do nothing.
        if (!this.bag.exists() || this.bag.getId() === this.sessionId) {
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

        // Not sure whether the code below is needed (that is: I can't figure out what goes wrong if I
        // don't do it, thus I can't write test code for it), but it feels right, so I added it.
        this.sessionId = undefined;
    }
}

