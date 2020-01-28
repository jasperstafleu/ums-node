import HttpResponse from "../Component/HttpResponse";
import {IncomingMessage} from "http";

class Main
{
    index(name: string, request: IncomingMessage): HttpResponse
    {
        return new HttpResponse(`Hello ${name} at ${request.url}`);
    }
}

module.exports = Main;
