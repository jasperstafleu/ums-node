import {IncomingMessage} from "http";
import RequestEvent from "$stafleu/Event/Event/RequestEvent";

export default class ExceptionEvent extends RequestEvent
{
    constructor(request: IncomingMessage, readonly e: Error)
    {
        super(request);
    }
}
