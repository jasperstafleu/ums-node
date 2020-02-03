import Engine from "$stafleu/Templating/Engine";
import ChainEngine from "$stafleu/Templating/ChainEngine";
import {Mock} from "ts-mocks";

describe('ChainEngine', () => {
    let chain: ChainEngine,
        templateNames: string[],
        engines: Mock<Engine>[];

    beforeEach(() => {
        chain = new ChainEngine();
        templateNames = [];
        engines = [];

        for (let it = 0; it < 3; ++it) {
            templateNames.push(Math.random().toString(36));
            engines.push(new Mock<Engine>({
                supports(name: string) { return name === templateNames[it]; },
                render() { return ''; }
            }));
            chain.addEngine(engines[it].Object);
        }
    });

    describe('\b.supports', () => {
        it('should support exactly all formats supported by engines that have been passed to it', () => {
            for (let it = 0; it < 3; ++it) {
                expect(chain.supports(templateNames[it])).toBe(true);
            }
            expect(chain.supports('rand')).toBe(false);
        });
    });

    describe('\b.render', () => {
        it('should act as a proxy for the engine that supports the template and was added last', () => {
            const expectedResult = Math.random().toString(36),
                parameters = {rand: Math.random()};

            engines[1].extend({render() { return expectedResult; }});

            const result = chain.render(templateNames[1], parameters);

            expect(result).toBe(expectedResult);

            expect(engines[0].Object.supports).not.toHaveBeenCalled(); // Added earlier, thus not checked for support
            expect(engines[0].Object.render).not.toHaveBeenCalled();
            expect(engines[1].Object.supports).toHaveBeenCalled();
            expect(engines[1].Object.render).toHaveBeenCalledWith(templateNames[1], parameters);
            expect(engines[2].Object.supports).toHaveBeenCalled(); // Added later, thus checked for support before 1
            expect(engines[2].Object.render).not.toHaveBeenCalled();
        });

        it('should throw an error if called without supporting the template', () => {

            expect(() => chain.render('not-supported')).toThrowError(Error);

            expect(engines[0].Object.supports).toHaveBeenCalled();
            expect(engines[0].Object.render).not.toHaveBeenCalled();
            expect(engines[1].Object.supports).toHaveBeenCalled();
            expect(engines[1].Object.render).not.toHaveBeenCalled();
            expect(engines[2].Object.supports).toHaveBeenCalled();
            expect(engines[2].Object.render).not.toHaveBeenCalled();
        });
    })
});
