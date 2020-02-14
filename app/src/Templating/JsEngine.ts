import Engine from "$stafleu/Templating/Engine";

export default class JsEngine implements Engine
{
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
        // TODO: Probably should do something to prevent unwanted injection here...
        // But I'm not going to; if you ever need this in production, use a real templating engine
        // Or leave me a bug report; I _might_ look into it if people actually start using this.
        // return eval('with (parameters) {`'+content+'`}');
        return (new Function('args', `with (args) { return \`${this.fs.readFileSync(name, 'utf8')}\`; }`))(parameters);
    }
}
