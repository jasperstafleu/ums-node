import Controller from "$stafleu/Controller/Controller";
import View from "$stafleu/Component/View";
import HttpRequest from "$stafleu/Component/HttpRequest";
import SessionBag from "$stafleu/Session/Bag/SessionBag";

export default class Main implements Controller
{
    constructor(protected bag: SessionBag)
    {
    }

    index(name: string, request: HttpRequest): View
    {
        const prev = this.bag.get('prev'), next = Math.floor(Math.random() * 1e3);

        this.bag.set('prev', next);

        return new View('local/template/helloWorld.html.jstpl', {
            name: name,
            url: request.url,
            previous: prev,
            next: next
        });
    }
}
