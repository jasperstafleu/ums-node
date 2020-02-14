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
        const values = this.bag.get('some-values') || [];

        values.push(Math.floor(Math.random() * 1e3));
        this.bag.set('some-values', values);

        return new View('local/template/helloWorld.html.jstpl', {
            name: name,
            url: request.url,
            values: values
        });
    }
}
