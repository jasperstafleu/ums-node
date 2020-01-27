import {KernelEvent} from "./KernelEvent";
import {HttpResponse} from "../../Component/HttpResponse";

export class RequestEvent extends KernelEvent
{
    response?: HttpResponse;
}