import RequestEvent from "$stafleu/Event/Event/RequestEvent";
import HttpRequest from "$stafleu/Component/HttpRequest";

export default class ViewEvent extends RequestEvent
{
    constructor(request: HttpRequest, readonly controllerResult: any)
    {
        super(request);
    }
}
