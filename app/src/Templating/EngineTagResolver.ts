import TagResolver from "$stafleu/Dependency/TagResolver";
import Container from "$stafleu/Dependency/Container";
import ChainEngine from "$stafleu/Templating/ChainEngine";

export default class EngineTagResolver implements TagResolver
{
    resolve(container: Container, serviceName: string, tag: {[key: string]: any}): void
    {
        container.decorate('templating', (engine: ChainEngine): void => {
            engine.addEngine(container.get(serviceName));
        });
    }
}
