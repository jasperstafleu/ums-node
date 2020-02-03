export default class View
{
    constructor(
        readonly template: string,
        readonly parameters: {[key: string]: any} = {},
        readonly httpCode: number = 200,
        readonly headers: {[key: string]: string} = {}
    ) {
    }
}