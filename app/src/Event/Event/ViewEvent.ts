import RequestEvent from "$stafleu/Event/Event/RequestEvent";
import {IncomingMessage} from "http";

export default class ViewEvent extends RequestEvent
{
    constructor(request: IncomingMessage, readonly controllerResult: any)
    {
        super(request);
    }
}
