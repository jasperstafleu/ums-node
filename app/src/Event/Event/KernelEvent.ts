import {IncomingMessage} from "http";

export default class KernelEvent
{
    constructor(readonly request: IncomingMessage)
    {
    }
}
