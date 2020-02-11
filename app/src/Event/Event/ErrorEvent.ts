import RequestEvent from "$stafleu/Event/Event/RequestEvent";
import HttpRequest from "$stafleu/Component/HttpRequest";

export default class ErrorEvent extends RequestEvent
{
    constructor(request: HttpRequest, readonly e: Error)
    {
        super(request);
    }
}
