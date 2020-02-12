import HttpResponse from "$stafleu/Component/HttpResponse";

describe('HttpResponse', () => {
    let response: HttpResponse;

    beforeEach(() => {
        response = new HttpResponse();
    });

    describe('\b.addHeader', () => {
        let header = Math.random().toString(36),
            value = Math.random().toString(36);

        it('should set the header as string if no header existed', () => {
            response.addHeader(header, value);

            expect(response.headers[header]).toBe(value);
        });

        it('should transform the header to an array containing both values if it was a string', () => {
            const existing = Math.random().toString(36);

            response.headers[header] = existing;
            response.addHeader(header, value);
            expect(response.headers[header]).toEqual([existing, value]);
        });

        it('should add the new header to the array if no header existed', () => {
            const existing1 = Math.random().toString(36),
                existing2 = Math.random().toString(36);

            response.headers[header] = [existing1, existing2];
            response.addHeader(header, value);
            expect(response.headers[header]).toEqual([existing1, existing2, value]);
        });
    });
});
