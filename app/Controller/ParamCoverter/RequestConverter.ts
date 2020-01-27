import {ParamConverter} from "../../Component/ParamConverter";
import {IncomingMessage} from "http";
import {RequestEvent} from "../../Event/Event/RequestEvent";

module.exports = class RequestConverter implements ParamConverter
{
    protected request: undefined | IncomingMessage;

    handleRequestEvent(event: RequestEvent): void
    {
        this.request = event.request;
    }

    supports(name: string): boolean
    {
        return name.substr(0, 7) === 'request';
    }

    convert(name: string, value: string): { position: number; value: IncomingMessage }
    {
        if (!this.request) {
            throw new Error('Request is not available');
        }

        return {
            position: parseInt(name.substr(7)),
            value: this.request
        }
    }
};
