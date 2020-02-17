import Controller from "$stafleu/Controller/Controller";
import View from "$stafleu/Component/View";
import HttpRequest from "$stafleu/Component/HttpRequest";
import SessionBag from "$stafleu/Session/Bag/SessionBag";
import UserRepository from "$stafleu_local/Database/UserRepository";

export default class Main implements Controller
{
    constructor(protected bag: SessionBag, protected userRepository: UserRepository)
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
            values: values,
            users: this.userRepository.findAll()
        });
    }
}
