export class HttpResponse
{
    content: string = '';
    httpCode: number = 200;
    headers: {[key: string]: string} = {};

    constructor(
        content: string = '',
        httpCode: number = 200,
        headers: {[key: string]: string} = {'Content-type': 'text/html'}
    ) {
        this.content = content;
        this.httpCode = httpCode;
        this.headers = headers;
    }
}
