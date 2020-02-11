import {IncomingHttpHeaders, IncomingMessage} from "http";

export default class HttpRequest
{
    protected cookieRegexp: RegExp | undefined;
    private cookieCache: {[key: string]: string | undefined} = {};

    constructor(protected message: IncomingMessage)
    {
    }

    get url(): string | undefined
    {
        return this.message.url;
    }

    get headers(): IncomingHttpHeaders
    {
        return this.message.headers;
    }

    get method(): string | undefined
    {
        return this.message.method;
    }

    getCookie(cookieName: string): string | undefined
    {
        if (this.cookieCache[cookieName]) {
            return this.cookieCache[cookieName];
        }

        if (!this.message.headers.cookie) {
            return;
        }

        this.cookieRegexp = this.cookieRegexp || /(?<=(^|;))\s*(.*?)=(.*?)(?=($|;))/g; // JIT, once only RegExp creation

        for (let cookie = this.cookieRegexp.exec(this.message.headers.cookie); cookie; cookie = this.cookieRegexp.exec(this.message.headers.cookie)) {
            if (cookie[2] === cookieName) {
                this.cookieRegexp.lastIndex = 0; // reset the index; when running the full loop, this is done automatically, but due to the break below, it isn't
                return this.cookieCache[cookieName] = cookie[3];
            }
        }

        return this.cookieCache[cookieName] = undefined;
    }
}