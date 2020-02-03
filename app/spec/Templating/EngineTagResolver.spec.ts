import {Mock} from "ts-mocks";
import Container from "$stafleu/Dependency/Container";
import EngineTagResolver from "$stafleu/Templating/EngineTagResolver";
import Engine from "$stafleu/Templating/Engine";
import ChainEngine from "$stafleu/Templating/ChainEngine";

describe('EngineTagResolver', () => {
    let resolver: EngineTagResolver;

    beforeEach(() => {
        resolver = new EngineTagResolver();
    });

    describe('\b.resolve', () => {
        let container: Mock<Container>,
            serviceName: string,
            chainEngine: Mock<ChainEngine>,
            engine: Mock<Engine>;

        beforeEach(() => {
            container = new Mock<Container>({decorate() {}});
            serviceName = Math.random().toString();
            engine = new Mock<Engine>();
            chainEngine = new Mock<ChainEngine>({addEngine() {}});
        });

        it('should add engines to the chain engine', () => {
            container.extend({
                decorate(sn: string, cb: (service: any) => void) {
                    if (sn === 'templating') {
                        cb(chainEngine.Object);
                    }
                },
                get(sn) {
                    return sn === serviceName ? engine.Object : null;
                }
            });

            resolver.resolve(container.Object, serviceName, {});

            expect(chainEngine.Object.addEngine).toHaveBeenCalledWith(engine.Object);
        });
    });
});
