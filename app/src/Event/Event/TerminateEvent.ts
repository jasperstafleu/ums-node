import {IncomingMessage} from "http";
import KernelEvent from "$stafleu/Event/Event/KernelEvent";
import HttpResponse from "$stafleu/Component/HttpResponse";

export default class TerminateEvent extends KernelEvent
{
    constructor(request: IncomingMessage, public response: HttpResponse)
    {
        super(request);
    }
}
