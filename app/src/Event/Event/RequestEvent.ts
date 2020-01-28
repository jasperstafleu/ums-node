import KernelEvent from "./KernelEvent";
import HttpResponse from "../../Component/HttpResponse";

export default class RequestEvent extends KernelEvent
{
    response?: HttpResponse;
}
