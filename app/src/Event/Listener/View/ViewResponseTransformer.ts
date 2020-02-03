import ViewEvent from "$stafleu/Event/Event/ViewEvent";
import HttpResponse from "$stafleu/Component/HttpResponse";
import View from "$stafleu/Component/View";
import Engine from "$stafleu/Templating/Engine";

export default class ViewResponseTransformer
{
    constructor(protected templating: Engine)
    {
    }

    transform(event: ViewEvent): void
    {
        if (event.response || !(event.controllerResult instanceof View)) {
            return;
        }

        const headers = {...event.controllerResult.headers};
        if (!headers['Content-Type']) {
            headers['Content-Type'] = event.controllerResult.template.includes('.html.') ? 'text/html' : 'text/plain';
        }

        event.response = new HttpResponse(
            this.templating.render(event.controllerResult.template, event.controllerResult.parameters),
            event.controllerResult.httpCode,
            headers
        );
    }
}
