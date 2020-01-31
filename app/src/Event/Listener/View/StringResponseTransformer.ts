import ViewEvent from "$stafleu/Event/Event/ViewEvent";
import HttpResponse from "$stafleu/Component/HttpResponse";

export default class StringResponseTransformer
{
    transform(event: ViewEvent): void
    {
        if (event.response || typeof event.controllerResult !== 'string') {
            return;
        }

        const httpCode = event.controllerResult === '' ? 204 : 200;
        let headers: {[key: string]: string}|undefined = undefined;

        if (event.controllerResult === '') {
            headers = {};
        } else if (event.controllerResult.startsWith('<!DOCTYPE html')) {
            headers = {'Content-Type': 'text/html'};
        }

        event.response = new HttpResponse(event.controllerResult, httpCode, headers);
    }
}
