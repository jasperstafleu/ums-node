import RequestEvent from "$stafleu/Event/Event/RequestEvent";
import {Mock} from "ts-mocks";
import {IncomingMessage} from "http";
import RequestConverter from "$stafleu/Controller/ParamCoverter/RequestConverter";

describe('RequestConverter', () => {
    let converter: any;

    beforeEach(() => {
        converter = new RequestConverter();
    });

    it('should only support names where first seven characters are \'request\`', () => {
        expect(converter.supports('request0')).toBe(true);
        expect(converter.supports('request1')).toBe(true);
        expect(converter.supports('request1000')).toBe(true);
        expect(converter.supports('req0')).toBe(false);
        expect(converter.supports('string')).toBe(false);
        expect(converter.supports('string0')).toBe(false);
        expect(converter.supports(Math.random().toString())).toBe(false);
    });

    it('should convert correct positions with value request', () => {
        const request = new Mock<IncomingMessage>(),
            event = new RequestEvent(request.Object),
            position = Math.round(Math.random() * 100);

        converter.handleRequestEvent(event);

        const result = converter.convert('request' + position, Math.random().toString());

        expect(result.position).toBe(position);
        expect(result.value).toBe(request.Object);
    });

    it('should throw an error if the request object has not yet been set', () => {
        expect(() => converter.convert('request0', Math.random().toString())).toThrowError(Error);
    });
});

