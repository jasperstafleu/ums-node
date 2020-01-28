import HttpResponse from "../../src/Component/HttpResponse";

describe('Constructor', () => {
    it('should have default arguments', () => {
        const response = new HttpResponse;

        expect(response.content).toBe('');
        expect(response.httpCode).toBe(200);
        expect(response.headers).toEqual({"Content-type": "text/html"});
    });

    it('should resolve non-default arguments correctly', () => {
        const content = Math.random().toString(),
            httpCode = Math.random(),
            headers = {"test": Math.random().toString()}
        ;

        const response = new HttpResponse(content, httpCode, headers);

        expect(response.content).toBe(content);
        expect(response.httpCode).toBe(httpCode);
        expect(response.headers).toEqual(headers);
    });

});
