import {IncomingMessage} from "http";
import Controller from "$stafleu/Controller/Controller";

export default class Main implements Controller
{
    index(name: string, request: IncomingMessage): string
    {
        return `Hello ${name} at ${request.url}`;
    }
}
