import KernelEvent from "$stafleu/Event/Event/KernelEvent";

export default class ControllerEvent extends KernelEvent
{
    controller?: Function;
}
