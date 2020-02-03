import JsEngine from "$stafleu/Templating/JsEngine";

describe('JsEngine', () => {
    let engine: JsEngine,
        fileExists: (fileName: string) => boolean,
        getContent: (fileName: string, encoding: string) => string;

    beforeEach(() => {
        engine = new JsEngine(
            (fileName) => fileExists(fileName),
            (fileName, encoding) => getContent(fileName, encoding)
        );
        fileExists = () => true;
        getContent = () => '';
    });

    describe('\b.supports', () => {
        it('should support template names ending in .jstpl only', () => {
            expect(engine.supports(Math.random().toString(36))).toBe(false);
            expect(engine.supports('.jstpl')).toBe(true);
            expect(engine.supports(Math.random().toString(36)+'.jstpl')).toBe(true);
        });

        it('should support existing templates only', () => {
            fileExists = (fileName) => fileName === 'exists.jstpl';

            expect(engine.supports('exists.jstpl')).toBe(true);
            expect(engine.supports('does-not-exist.jstpl')).toBe(false);
        });
    });

    describe('\b.render', () => {
        it('should render .jstpl files', () => {
            const fileName = Math.random().toString(36) + '.jstpl',
                templ = Math.random().toString(36);

            getContent = (fn) => fn === fileName ? templ : '';

            expect(engine.render(fileName)).toBe(templ);

        });

        it('should render literals', () => {
            const fileName = Math.random().toString(36) + '.jstpl',
                literal = Math.random(),
                templLiteral = 'success: ${lit}';

            getContent = (fn) => fn === fileName ? templLiteral : '';

            expect(engine.render(fileName, {lit: literal})).toBe('success: '+literal);
        });

        it('should not render literals that were not passed in parameters', () => {
            const fileName = Math.random().toString(36) + '.jstpl',
                templLiteral = 'success: ${lit}';

            getContent = (fn) => fn === fileName ? templLiteral : '';

            expect(engine.render(fileName)).toBe(templLiteral);
        });

        it('should allow mixing literals to be rendered and non-literals', () => {
            const fileName = Math.random().toString(36) + '.jstpl',
                literal = Math.random(),
                templLiteral = 'success: ${non-lit} ${lit}';

            getContent = (fn) => fn === fileName ? templLiteral : '';

            expect(engine.render(fileName, {lit: literal})).toBe('success: ${non-lit} '+literal);
        });
    });
});
