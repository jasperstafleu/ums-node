import Engine from "$stafleu/Templating/Engine";

export default class JsEngine implements Engine
{
    private literalMatcher = new RegExp('\\${([^}]*)}', 'g');

    constructor(
        protected fs: {
            existsSync: (fileName: string) => boolean,
            readFileSync: (fileName: string, encoding: string) => string
        }
    ) {
    }

    supports(name: string): boolean
    {
        return name.substr(-6) === '.jstpl' && this.fs.existsSync(name);
    }

    render(name: string, parameters: {[key: string]: any} = {}): string
    {
        const content = this.fs
            .readFileSync(name, 'utf8')
            .replace(this.literalMatcher, (loos, match) => {
                return match in parameters ? `\${parameters.${match}}` : `\\\${${match}}`;
            })
        ;

        // TODO: Probably should do something to prevent unwanted injection here...
        return eval('`'+content+'`');
    }
}