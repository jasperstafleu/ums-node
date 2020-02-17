import TagResolver from "$stafleu/Dependency/TagResolver";
import RecursiveDependencyInjection from "$stafleu/Error/RecursiveDependencyInjection";
import MissingTagName from "$stafleu/Error/MissingTagName";

export default class Container
{
    protected services: {[key:string]: any} = {};
    protected tagResolvers: {[key:string]: TagResolver} = {};
    private tagsToBeResolved: Function[]= [];
    private closed: boolean = false;
    private commonReplacables = ['arguments', 'fields'];

    constructor (protected require: (id: string) => any, protected fs: {readFileSync: (filename: string) => string})
    {
    }

    get (serviceName: string): any
    {
        if (!this.services[serviceName]) {
            throw new Error(`Unknown service '${serviceName}' requested`);
        }

        if (typeof this.services[serviceName] == 'function') {
            // We are going to overwrite the service definition (a callback) by the service itself. This allows for
            // services to be cached / singletons. While resolving the service, resolving the same service another time
            // means we hit an infinite recursion, which must raise an error.
            const definition = this.services[serviceName];

            this.services[serviceName] = () => {
                throw new RecursiveDependencyInjection(`Recursive definition detected on ${serviceName}`);
            };

            this.services[serviceName] = definition();
        }

        return this.services[serviceName];
    }

    decorate (serviceName: string, decorator: (service: any) => void): void
    {
        if (!this.services[serviceName]) {
            throw new Error(`Cannot decorate '${serviceName}': it has not yet been added`);
        }

        const serviceDefinition = this.services[serviceName];

        // Defer actual decoration until the get method is called.
        this.services[serviceName] = () => {
            const service = serviceDefinition.call(serviceName);

            decorator(service);

            return service;
        };
    }

    addService(serviceName: string, callback: () => any): Container
    {
        if (this.closed) {
            // Mainly due to tags already having been resolved, throw error if this happens
            throw new Error('Can not add services to a closed container');
        }

        this.services[serviceName] = callback;

        return this;
    }

    addTagResolver(tagName: string, resolver: TagResolver): Container
    {
        this.tagResolvers[tagName] = resolver;

        return this;
    }

    loadConfigFromFile(fileName: string): Container
    {
        const config = JSON.parse(this.fs.readFileSync(fileName));

        for (let serviceName of Object.keys(config)) {
            if (!config[serviceName].class && config[serviceName].class !== '') {
                throw new Error(`Service '${serviceName}' has no 'class' configuration.`);
            }

            this.addService(serviceName, () => {
                let cls;

                if (config[serviceName].class === '') {
                    cls = '';
                } else if (config[serviceName].class.includes('.')) {
                    let parts = config[serviceName].class.split('.');
                    let part = parts.shift();
                    cls = this.require(part);
                    while (part = parts.shift()) {
                        cls = cls[part];
                    }
                } else {
                    cls = this.require(config[serviceName].class);
                    if (cls.default) {
                        cls = cls.default;
                    }
                }

                for (let it = this.commonReplacables.length - 1; it >= 0; --it) {
                    if (config[serviceName][this.commonReplacables[it]]) {
                        config[serviceName][this.commonReplacables[it]] = this.doCommonReplacements(config[serviceName][this.commonReplacables[it]]);
                    }
                }
                const args = config[serviceName].arguments || [];

                let object;
                try {
                    // Try it as a constructor...
                    object = cls === '' ? {} : new cls(...args);
                } catch (e) {
                    // ... but catch the error if it is not;
                    // it must therefore be either a factory (if arguments were supplied)
                    // or a module inclusion of a function
                    object = Array.isArray(config[serviceName].arguments) ? cls(...args) : cls;
                }

                if (config[serviceName].fields) {
                    let keys = Object.keys(config[serviceName].fields);
                    for (let it = keys.length - 1; it >= 0; --it) {
                        object[keys[it]] = config[serviceName].fields[keys[it]];
                    }
                }

                return object;
            });

            if (config[serviceName].tags) {
                this.tagsToBeResolved.push(() => this.resolveTags(serviceName, config[serviceName].tags));
            }
        }

        return this;
    }

    protected doCommonReplacements(obj: object|any[]): object|any[]
    {
        if (Array.isArray(obj)) {
            for (let it = obj.length - 1; it >= 0; --it) {
                obj[it] = this.commonReplacement(obj[it]);
            }
        } else {
            for (let keys = Object.keys(obj), it = keys.length - 1; it >= 0; --it) {
                (obj as any)[keys[it]] = this.commonReplacement((obj as any)[keys[it]]);
            }
        }

        return obj;
    }

    protected commonReplacement(key: any) {
        let ret: any = key;

        if (typeof key === 'string' && key.charAt(0) === '@') {
            if (key.substring(0, 6) === '@type:') {
                ret = this.require(key.substring(6)).constructor;
            } else if (key.substring(0, 5) === '@env.') {
                ret = process.env[key.substring(5)];
            } else {
                ret = this.get(key.substring(1));
            }
        } else if (typeof key === 'object') {
            ret = this.doCommonReplacements(key);
        }

        return ret;
    }

    protected resolveTags(serviceName: string, tags: {[key: string]: any}[])
    {
        for (let it = 0, len = tags.length; it < len; ++it) {
            let tag = tags[it];

            if (!('name' in tag)) {
                throw new MissingTagName(`A tag on service '${serviceName}' lacks a name, and can therefore not be resolved`);
            }

            if (this.tagResolvers[tag.name]) {
                this.tagResolvers[tag.name].resolve(this, serviceName, tag);
            } else {
                // If no tag resolver has been configured for the passed tag, ignore this. It is a valid use-case
                // (service is tagged for a no longer existing function).
                // In fact, logging this would be nice.
                if (this.services['logger']) {
                    this.get('logger').debug(`Tag ${tag.name} has no resolver`);
                }
            }
        }
    }

    close(): Container
    {
        if (this.closed) {
            throw new Error('Container is already closed, and can\'t be closed again.');
        }

        this.closed = true;

        // Only resolve the tag resolvers once all services have been defined. Makes life a lot easier.
        for (let it = this.tagsToBeResolved.length - 1; it >= 0; --it) {
            this.tagsToBeResolved[it]();
        }

        return this;
    }
}
