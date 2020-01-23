'use strict';

import {RequestEvent} from "../Event/RequestEvent";
import {HttpResponse} from "../../Component/HttpResponse";

module.exports = class RequestListener
{
    handle(event: RequestEvent): void
    {
        event.response = new HttpResponse('Hello world');
    }
};
