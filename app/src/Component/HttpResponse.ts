export default class HttpResponse {
    constructor(
        public content: string = '',
        public httpCode: number = 200,
        public headers: { [key: string]: string | string[] } = {'Content-Type': 'text/plain'}
    ) {
    }
}
