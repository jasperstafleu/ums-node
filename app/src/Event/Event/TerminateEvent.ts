import KernelEvent from "$stafleu/Event/Event/KernelEvent";
import HttpResponse from "$stafleu/Component/HttpResponse";
import HttpRequest from "$stafleu/Component/HttpRequest";

export default class TerminateEvent extends KernelEvent
{
    constructor(request: HttpRequest, public response: HttpResponse)
    {
        super(request);
    }
}
