import Engine from "$stafleu/Templating/Engine";

export default class ChainEngine implements Engine
{
    protected engines: Engine[] = [];

    addEngine(engine: Engine): void
    {
        this.engines.push(engine);
    }

    supports(name: string): boolean
    {
        for (let it = this.engines.length - 1; it >= 0; --it) {
            if (this.engines[it].supports(name)) {
                return true;
            }
        }

        return false;
    }

    render(name: string, parameters: {[key: string]: any} = {}): string
    {
        for (let it = this.engines.length - 1; it >= 0; --it) {
            if (this.engines[it].supports(name)) {
                return this.engines[it].render(name, parameters);
            }
        }

        throw new Error(`No supporting render engine found for ${name}.`);
    }
}
