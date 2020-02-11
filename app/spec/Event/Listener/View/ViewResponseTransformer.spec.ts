import ViewEvent from "$stafleu/Event/Event/ViewEvent";
import {Mock} from "ts-mocks";
import StringResponseTransformer from "$stafleu/Event/Listener/View/StringResponseTransformer";
import ViewResponseTransformer from "$stafleu/Event/Listener/View/ViewResponseTransformer";
import Engine from "$stafleu/Templating/Engine";
import HttpResponse from "$stafleu/Component/HttpResponse";
import View from "$stafleu/Component/View";
import HttpRequest from "$stafleu/Component/HttpRequest";

describe('ViewResponseTransformer', () => {
    describe('\b.transform', () => {
        let transformer: StringResponseTransformer,
            templateEngine: Mock<Engine>,
            request: Mock<HttpRequest>;

        beforeEach(() => {
            templateEngine = new Mock<Engine>({render: () => ''});
            transformer = new ViewResponseTransformer(templateEngine.Object);
            request = new Mock<HttpRequest>();
        });

        it('should ignore non-view results', () => {
            const controllerResult = '',
                event = new ViewEvent(request.Object, controllerResult);

            transformer.transform(event);

            expect(event.response).toBe(undefined);
        });

        it('should ignore view results if event already has response', () => {
            const controllerResult = new View(''),
                response = new HttpResponse(),
                event = new ViewEvent(request.Object, controllerResult);

            event.response = response;

            transformer.transform(event);

            expect(event.response).toBe(response);
        });

        it('should transform views by passing the template to the engine\'s render method', () => {
            const expectedContent = Math.random().toString(36),
                template = Math.random().toString(36),
                parameters = {rand: Math.random()},
                httpCode = Math.random(),
                headers = {head: Math.random().toString(36)},
                event = new ViewEvent(request.Object, new View(template, parameters, httpCode, headers));

            templateEngine.extend({render: (templ, params) => {
                return templ === template && params === parameters ? expectedContent : ''
            }});

            transformer.transform(event);

            expect(event.response).toBeInstanceOf(HttpResponse);
            const response = event.response as HttpResponse;
            expect(response.content).toBe(expectedContent);
            expect(response.httpCode).toBe(httpCode);
            expect(response.headers.head).toBe(headers.head);
        });

        it('should add text/plain content type to view without content type', () => {
            const template = Math.random().toString(36),
                event = new ViewEvent(request.Object, new View(template));

            transformer.transform(event);

            expect(event.response).toBeInstanceOf(HttpResponse);
            const response = event.response as HttpResponse;
            expect(response.headers['Content-Type']).toBe('text/plain');
        });

        it('should add text/html content type to view without content type with .html. in name', () => {
            const template = Math.random().toString(36)+'.html.whatever',
                event = new ViewEvent(request.Object, new View(template));

            transformer.transform(event);

            expect(event.response).toBeInstanceOf(HttpResponse);
            const response = event.response as HttpResponse;
            expect(response.headers['Content-Type']).toBe('text/html');
        });

        it('should leave existing content type header as is', () => {
            const template = Math.random().toString(36) + '.html.whatever',
                someContentType = Math.random().toString(36),
                event = new ViewEvent(request.Object, new View(template, {}, 200, {'Content-Type': someContentType}));

            transformer.transform(event);

            expect(event.response).toBeInstanceOf(HttpResponse);
            const response = event.response as HttpResponse;
            expect(response.headers['Content-Type']).toBe(someContentType);
        });
    });
});
