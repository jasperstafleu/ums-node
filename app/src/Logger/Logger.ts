export default class Logger
{
    emergency(message: string, context: object = {}): void
    {
        this.log('emergency', message, context);
    }

    alert(message: string, context: object = {}): void
    {
        this.log('alert', message, context);
    }

    critical(message: string, context: object = {}): void
    {
        this.log('critical', message, context);
    }

    error(message: string, context: object = {}): void
    {
        this.log('error', message, context);
    }

    warning(message: string, context: object = {}): void
    {
        this.log('warning', message, context);
    }

    notice(message: string, context: object = {}): void
    {
        this.log('notice', message, context);
    }

    info(message: string, context: object = {}): void
    {
        this.log('info', message, context);
    }

    debug(message: string, context: object = {}): void
    {
        this.log('debug', message, context);
    }

    log(level: string, message: string, context: object = {}): void
    {
        console.log(new Date(), level.toUpperCase(), message, context);
    }
}
