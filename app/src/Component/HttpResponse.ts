export default class HttpResponse {
    constructor(
        public content: string = '',
        public httpCode: number = 200,
        public headers: { [key: string]: string | string[] } = {'Content-Type': 'text/plain'}
    ) {
    }

    public addHeader(name: string, value: string): this
    {
        if (!(name in this.headers)) {
            this.headers[name] = value;
        } else if (typeof this.headers[name] === 'string') {
            this.headers[name] = [
                (this.headers[name] as string),
                value
            ];
        } else {
            (this.headers[name] as string[]).push(value);
        }

        return this;
    }
}
