import RequestLogger from "$stafleu/Event/Listener/Request/RequestLogger";
import Logger from "$stafleu/Logger/Logger";
import {Mock} from "ts-mocks";
import RequestEvent from "$stafleu/Event/Event/RequestEvent";
import {IncomingMessage} from "http";

describe('RequestLogger', () => {
    let logger: Mock<Logger>,
        reqLogger: RequestLogger;

    beforeEach(() => {
        logger = new Mock<Logger>();
        reqLogger = new RequestLogger(logger.Object);
    });

    describe('\b.handle', () => {
        let request: Mock<IncomingMessage>,
            event: Mock<RequestEvent>;

        beforeEach(() => {
            request = new Mock<IncomingMessage>();
            event = new Mock<RequestEvent>();
        });

        it('should log request at info level', () => {
            const method = Math.random().toString(),
                host = Math.random().toString(),
                url = Math.random().toString();

            logger.extend({
                info(message: string, context: any) {
                    expect(message).toBe('Received request');
                    expect(context).toEqual({url: `${method} ${host}${url}`});
                }
            });

            event.extend({request: request.Object});

            request.extend({
                method: method,
                headers: { host: host },
                url: url
            });

            reqLogger.handle(event.Object);

            expect(logger.Object.info).toHaveBeenCalledTimes(1);
        });
    });
});
