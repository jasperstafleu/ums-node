import TagResolver from "$stafleu/Dependency/TagResolver";
import RecursiveDependencyInjection from "$stafleu/Exception/RecursiveDependencyInjection";
import MissingTagName from "$stafleu/Exception/MissingTagName";

export default class Container
{
    protected services: {[key:string]: any} = {};
    protected tagResolvers: {[key:string]: TagResolver} = {};
    private tagsToBeResolved: Function[]= [];
    private closed: boolean = false;

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
            // means we hit an infinite recursion, which must raise an exception.
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
        this.services[serviceName] = (): any => {
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
            if (!config[serviceName].class) {
                throw new Error(`Service '${serviceName}' has no 'class' configuration.`);
            }

            this.addService(serviceName, () => {
                let cls;

                if (config[serviceName].class.includes('.')) {
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

                const args = config[serviceName].arguments || [];
                for (let it = args.length - 1; it >= 0; --it) {
                    if (typeof args[it] === 'string' && args[it].charAt(0) === '@') {
                        args[it] = this.get(args[it].substring(1));
                    }
                }

                try {
                    // Try it as a constructor...
                    return new cls(...args);
                } catch (e) {
                    // ... but catch the error if it is not;
                    // it must therefore be either a factory (if arguments were supplied)
                    // or a module inclusion of a function
                    return Array.isArray(config[serviceName].arguments) ? cls(...args) : cls;
                }
            });

            if (config[serviceName].tags) {
                this.tagsToBeResolved.push(() => this.resolveTags(serviceName, config[serviceName].tags));
            }
        }

        return this;
    }

    protected resolveTags(serviceName: string, tags: any[])
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
