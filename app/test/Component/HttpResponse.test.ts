const HttpResponse = require("../../src/Component/HttpResponse");

test('Triv', () => {
    const httpResponse = new HttpResponse;

    expect(12).toBe(12);
});