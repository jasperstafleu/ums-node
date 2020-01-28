import {IncomingMessage} from "http";
import KernelEvent from "$stafleu/Event/Event/KernelEvent";
import HttpResponse from "$stafleu/Component/HttpResponse";

export default class ResponseEvent extends KernelEvent
{
    response: HttpResponse;

    constructor(request: IncomingMessage, response: HttpResponse)
    {
        super(request);
        this.response = response;
    }
}
