import {IncomingMessage} from "http";

export default class KernelEvent
{
    readonly request: IncomingMessage;

    constructor(request: IncomingMessage)
    {
        this.request = request;
    }
}
