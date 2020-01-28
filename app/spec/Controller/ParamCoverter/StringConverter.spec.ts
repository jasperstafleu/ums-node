describe('StringConverter', () => {
    const StringConverter = require("../../../src/Controller/ParamCoverter/StringConverter");
    let converter: any;

    beforeEach(() => {
        converter = new StringConverter;
    });

    ///------------------------------------------------------------------------
    it('should only support names where first six characters are \'string\`', () => {
        expect(converter.supports('string0')).toBe(true);
        expect(converter.supports('string1')).toBe(true);
        expect(converter.supports('string1000')).toBe(true);
        expect(converter.supports('strin0')).toBe(false);
        expect(converter.supports('request0')).toBe(false);
        expect(converter.supports(Math.random().toString())).toBe(false);
    });

    ///------------------------------------------------------------------------
    it('should convert correct positions with value request', () => {
        const value = Math.random().toString(),
            position = Math.round(Math.random() * 100),
            result = converter.convert('string' + position, value);

        expect(result.position).toBe(position);
        expect(result.value).toBe(value);
    });
});

