'use strict';

module.exports = class RequestEvent
{
    #request = null;
    #response = null;

    constructor(request, response)
    {
        this.#request = request;
        this.#response = response;
    }

    get request()  { return this.#request; }
    get response() { return this.#response; }
};
