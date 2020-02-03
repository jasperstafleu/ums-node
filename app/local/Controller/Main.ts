import {IncomingMessage} from "http";
import Controller from "$stafleu/Controller/Controller";
import View from "$s`tafleu/Component/View";

export default class Main implements Controller
{
    index(name: string, request: IncomingMessage): View
    {
        return new View('local/template/helloWorld.html.jstpl', {
            name: name,
            url: request.url
        });
    }
}
