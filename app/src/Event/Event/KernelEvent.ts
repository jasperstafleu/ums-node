import {IncomingMessage} from "http";

export default class KernelEvent
{
    constructor(readonly request: IncomingMessage)
    {
    }
}

export { default as ControllerEvent } from "$stafleu/Event/Event/ControllerEvent";
export { default as FinishRequestEvent } from "$stafleu/Event/Event/FinishRequestEvent";
export { default as RequestEvent } from "$stafleu/Event/Event/RequestEvent";
export { default as ResponseEvent } from "$stafleu/Event/Event/ResponseEvent";
export { default as ViewEvent } from "$stafleu/Event/Event/ViewEvent";
