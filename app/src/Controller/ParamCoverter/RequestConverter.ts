import ParamConverter from "$stafleu/Component/ParamConverter";
import RequestEvent from "$stafleu/Event/Event/RequestEvent";
import HttpRequest from "$stafleu/Component/HttpRequest";

export default class RequestConverter implements ParamConverter
{
    protected request: undefined | HttpRequest;

    handleRequestEvent(event: RequestEvent): void
    {
        this.request = event.request;
    }

    supports(name: string): boolean
    {
        return name.substr(0, 7) === 'request';
    }

    convert(name: string, value: string): { position: number; value: HttpRequest }
    {
        if (!this.request) {
            throw new Error('Request is not available');
        }

        return {
            position: parseInt(name.substr(7)),
            value: this.request
        }
    }
}
