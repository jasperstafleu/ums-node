import {IncomingMessage} from "http";
import HttpResponse from "$stafleu/Component/HttpResponse";
import Controller from "$stafleu/Controller/Controller";

export default class Main implements Controller
{
    index(name: string, request: IncomingMessage): HttpResponse
    {
        return new HttpResponse(`Hello ${name} at ${request.url}`);
    }
}
