import NumberConverter from "$stafleu/Controller/ParamCoverter/NumberConverter";

describe('NumberConverter', () => {
    let converter: any;

    beforeEach(() => {
        converter = new NumberConverter();
    });

    it('should only support names where first six characters are \'number\`', () => {
        expect(converter.supports('number0')).toBe(true);
        expect(converter.supports('number1')).toBe(true);
        expect(converter.supports('number1000')).toBe(true);
        expect(converter.supports('numbe0')).toBe(false);
        expect(converter.supports('request0')).toBe(false);
        expect(converter.supports(Math.random().toString())).toBe(false);
    });

    it('should convert correct positions with value request', () => {
        const value = Math.random().toString(),
            position = Math.round(Math.random() * 100),
            result = converter.convert('number' + position, value);

        expect(result.position).toBe(position);
        expect(result.value).toBe(parseFloat(value));
    });
});
