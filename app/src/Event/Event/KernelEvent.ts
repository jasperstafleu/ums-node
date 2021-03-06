import HttpRequest from "$stafleu/Component/HttpRequest";

export default class KernelEvent
{
    constructor(readonly request: HttpRequest)
    {
    }
}

export {default as ControllerEvent} from "$stafleu/Event/Event/ControllerEvent";
export {default as ErrorEvent} from "$stafleu/Event/Event/ErrorEvent";
export {default as FinishRequestEvent} from "$stafleu/Event/Event/FinishRequestEvent";
export {default as RequestEvent} from "$stafleu/Event/Event/RequestEvent";
export {default as ResponseEvent} from "$stafleu/Event/Event/ResponseEvent";
export {default as TerminateEvent} from "$stafleu/Event/Event/TerminateEvent";
export {default as ViewEvent} from "$stafleu/Event/Event/ViewEvent";
