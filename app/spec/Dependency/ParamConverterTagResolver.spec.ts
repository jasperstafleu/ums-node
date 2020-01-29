import Container from "../../src/Dependency/Container";
import {Mock} from "ts-mocks";
import ParamConverterTagResolver from "../../src/Dependency/ParamConverterTagResolver";
import ControllerResolver from "$stafleu/Event/Listener/Controller/ControllerResolver";
import ParamConverter from "$stafleu/Component/ParamConverter";

describe('ParamConverterTagResolver', () => {
    let resolver: ParamConverterTagResolver;

    beforeEach(() => {
        resolver = new ParamConverterTagResolver();
    });

    describe('\b.resolve', () => {
        let container: Mock<Container>, converterName: string;

        beforeEach(() => {
            container = new Mock<Container>({decorate() {}});
            converterName = Math.random().toString();
        });

        it('should decorate the container by calling addParamConverter on the resolver', () => {
            const tag = {name: Math.random().toString(), event: Math.random().toString(), method: "method"},
                controllerResolver = new Mock<ControllerResolver>(),
                converter = new Mock<ParamConverter>();

            container.extend({
                decorate(sn: string, cb: (service: any) => void) {
                    expect(sn).toBe('event.controller_resolver');
                    cb(controllerResolver.Object);
                },
                get(sn) {
                    expect(sn).toBe(converterName);
                    return converter.Object;
                }
            });

            controllerResolver.extend({
                addParamConverter(conv: ParamConverter) {
                    expect(conv).toEqual(converter.Object);
                }
            });

            resolver.resolve(container.Object, converterName, tag);

            expect(controllerResolver.Object.addParamConverter).toHaveBeenCalledTimes(1);
        });
    });
});
