import {TagResolver} from "./TagResolver";

export class Container
{
    protected fs: (filename: string) => string;
    protected pathToRoot: string = '';
    protected services: {[key:string]: any} = {};
    protected tagResolvers: {[key:string]: TagResolver} = {};
    private tagsToBeResolved: Function[]= [];
    private closed: boolean = false;

    constructor (pathToRoot: string, fs: (filename: string) => string)
    {
        this.pathToRoot = pathToRoot;
        this.fs = fs;
    }

    get (serviceName: string): any
    {
        if (!this.services[serviceName]) {
            throw new Error(`Unknown service '${serviceName}' requested`);
        }

        if (typeof this.services[serviceName] == 'function') {
            // Overwrite original service definition to ensure service is a "singleton".
            this.services[serviceName] = this.services[serviceName]();
        }

        return this.services[serviceName];
    }

    decorate (serviceName: string, decorator: (service: any) => void): void
    {
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
        const config = JSON.parse(this.fs(fileName));

        for (let serviceName of Object.keys(config)) {
            if (!config[serviceName].class) {
                throw new Error(`Service '${serviceName}' has no 'class' configuration.`);
            }

            this.addService(serviceName, () => {
                const cls = require(this.pathToRoot + config[serviceName].class);
                const args = config[serviceName].arguments || [];

                for (let it = args.length - 1; it >= 0; --it) {
                    if (typeof args[it] === 'string' && args[it].charAt(0) === '@') {
                        args[it] = container.get(args[it].substring(1));
                    }
                }

                return new cls(...args);
            });

            if (config[serviceName].tags) {
                this.tagsToBeResolved.push(() => this.resolveTags(serviceName, config[serviceName].tags));
            }
        }

        return this;
    }

    protected resolveTags(serviceName: string, tags: any[])
    {
        for (let it = tags.length - 1; it >= 0; --it) {
            let tag = tags[it];
            if (!('name' in tag && this.tagResolvers[tag.name])) {
                throw new Error(`A tag on service '${serviceName}' lacks a name, and can therefore not be resolved`);
            }

            this.tagResolvers[tag.name].resolve(this, serviceName, tag);
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

let container = new Container('../', require('fs').readFileSync);
module.exports = container
    .loadConfigFromFile('config/services/core.json')
    .loadConfigFromFile('config/services/event_listeners.json')
    .loadConfigFromFile('config/services/controllers.json')
    .addTagResolver('kernel.event_listener', container.get('event.listener_tag_resolver'))
    .addTagResolver('controller', container.get('controller.tag_resolver'))
    .addTagResolver('param_converter', container.get('param_converter.tag_resolver'))
    .close()
;
