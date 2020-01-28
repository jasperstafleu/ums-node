import HttpResponse from "$stafleu/Component/HttpResponse";
import {IncomingMessage} from "http";

export default class Main
{
    index(name: string, request: IncomingMessage): HttpResponse
    {
        return new HttpResponse(`Hello ${name} at ${request.url}`);
    }
}
