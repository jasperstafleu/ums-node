import Controller from "$stafleu/Controller/Controller";
import View from "$stafleu/Component/View";
import HttpRequest from "$stafleu/Component/HttpRequest";
import SessionBag from "$stafleu/Session/Bag/SessionBag";
import EntityRepository from "$stafleu/Database/EntityRepository";
import User from "$stafleu_local/Models/User";

export default class Main implements Controller
{
    constructor(protected bag: SessionBag, protected userRepository: EntityRepository<User>)
    {
    }

    index(id: number|undefined, request: HttpRequest): View
    {
        const values = this.bag.get('some-values') || [];

        values.push(Math.floor(Math.random() * 1e3));
        this.bag.set('some-values', values);

        const user = id ? this.userRepository.find(id) : undefined;

        return new View('local/template/helloWorld.html.jstpl', {
            name: user ? user.name : 'anonymous',
            url: request.url,
            values: values,
            users: this.userRepository.findAll()
        });
    }
}
