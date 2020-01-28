import KernelEvent from "$stafleu/Event/Event/KernelEvent";
import HttpResponse from "$stafleu/Component/HttpResponse";

export default class RequestEvent extends KernelEvent
{
    response?: HttpResponse;
}
