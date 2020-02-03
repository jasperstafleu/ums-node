import {IncomingMessage} from "http";
import Controller from "$stafleu/Controller/Controller";
import TemplateEngine from "$stafleu/Templating/Engine";

export default class Main implements Controller
{
    constructor(protected templating: TemplateEngine)
    {
    }

    index(name: string, request: IncomingMessage): string
    {
        return this.templating.render('local/template/helloWorld.html.jstpl', {
            name: name,
            url: request.url
        });
    }
}
