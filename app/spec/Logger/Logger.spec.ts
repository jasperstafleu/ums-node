import Logger from "$stafleu/Logger/Logger";

describe('Logger', () => {
    let message: string,
        context: {},
        logger: Logger;

    beforeEach(() => {
        logger = new Logger();
        message = Math.random().toString(36);
        context = {rand: Math.random()};
    });

    describe('\b.log', () => {
        it('should log containing capitalized level', () => {
            const logLevel = Math.random().toString(36),
                consoleLogSpy = spyOn(console, 'log');

            logger.log(logLevel, message, context);
            expect(console.log).toHaveBeenCalledTimes(1);
            expect(console.log).toHaveBeenCalledWith(
                jasmine.any(Date),
                logLevel.toUpperCase(),
                message,
                context
            );

            expect(consoleLogSpy.calls.mostRecent().args[0].getTime()).toBeCloseTo((new Date).getTime(), -2);
        });
    });

    describe('Specific log levels should defer to generic log method', () => {
        beforeEach(() => {
            spyOn(logger, 'log');
        });

        const assertIsProxy = (logLevel: Function) => {
            logLevel.call(logger, message, context);
            expect(logger.log).toHaveBeenCalledTimes(1);
            expect(logger.log).toHaveBeenCalledWith(logLevel.name, message, context);
        };

        it('\b.emergency should log containing EMERGENCY', () => assertIsProxy(logger.emergency));
        it('\b.alert should log containing ALERT', () => assertIsProxy(logger.alert));
        it('\b.critical should log containing CRITICAL', () => assertIsProxy(logger.critical));
        it('\b.error should log containing ERROR', () => assertIsProxy(logger.error));
        it('\b.warning should log containing WARNING', () => assertIsProxy(logger.warning));
        it('\b.notice should log containing NOTICE', () => assertIsProxy(logger.notice));
        it('\b.info should log containing INFO', () => assertIsProxy(logger.info));
        it('\b.debug should log containing DEBUG', () => assertIsProxy(logger.debug));
    });
});