import ViewEvent from "$stafleu/Event/Event/ViewEvent";
import {Mock} from "ts-mocks";
import StringResponseTransformer from "$stafleu/Event/Listener/View/StringResponseTransformer";
import HttpResponse from "$stafleu/Component/HttpResponse";
import HttpRequest from "$stafleu/Component/HttpRequest";

describe('StringResponseTransformer', () => {
    describe('\b.transform', () => {
        let transformer: StringResponseTransformer,
            request: Mock<HttpRequest>;

        beforeEach(() => {
            transformer = new StringResponseTransformer();
            request = new Mock<HttpRequest>();
        });

        it('should ignore non-string results', () => {
            const controllerResult = new Date,
                event = new ViewEvent(request.Object, controllerResult);

            transformer.transform(event);

            expect(event.response).toBe(undefined);
        });

        it('should ignore string results if event already has response', () => {
            const controllerResult = '',
                response = new HttpResponse(),
                event = new ViewEvent(request.Object, controllerResult);

            event.response = response;

            transformer.transform(event);

            expect(event.response).toBe(response);
        });

        it('should put generic non-empty string controller result into a response object with  text/plain and code 200', () => {
            const controllerResult = 'some generic string',
                event = new ViewEvent(request.Object, controllerResult);

            transformer.transform(event);

            expect(event.response).toBeInstanceOf(HttpResponse);
            const response = (event.response as HttpResponse);
            expect(response.content).toBe(controllerResult);
            expect(response.httpCode).toBe(200);
            expect(response.headers['Content-Type']).toBe('text/plain');
        });

        it('should put empty string results into a response object without content header and code 204', () => {
            const controllerResult = '',
                event = new ViewEvent(request.Object, controllerResult);

            transformer.transform(event);

            expect(event.response).toBeInstanceOf(HttpResponse);
            const response = (event.response as HttpResponse);
            expect(response.content).toBe(controllerResult);
            expect(response.httpCode).toBe(204);
            expect(response.headers['Content-Type']).not.toBeTruthy();
        });

        it('should put html results into a response object with text/html and code 200', () => {
            const controllerResult = '<!DOCTYPE html>\n<html></html>',
                event = new ViewEvent(request.Object, controllerResult);

            transformer.transform(event);

            expect(event.response).toBeInstanceOf(HttpResponse);
            const response = (event.response as HttpResponse);
            expect(response.content).toBe(controllerResult);
            expect(response.httpCode).toBe(200);
            expect(response.headers['Content-Type']).toBe('text/html');
        });
    });
});
