'use strict';

import {TagResolver} from "./TagResolver";

export class Container
{
    protected services: {[key:string]: any} = {};
    protected fs = require('fs');
    protected tagResolvers: {[key:string]: TagResolver} = {};
    private tagsToBeResolved = [];
    private closed: boolean = false;

    get (serviceName: string): any
    {
        if (!this.services[serviceName]) {
            throw new Error(`Unknown service '${serviceName}' requested`);
        }

        if (typeof this.services[serviceName] == 'function') {
            this.services[serviceName] = this.services[serviceName]();
        }

        return this.services[serviceName];
    }

    getDefinition (serviceName: string): any
    {
        if (this.closed) {
            throw new Error('Can not get definition from closed container');
        }

        return this.services[serviceName];
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
        const config = JSON.parse(this.fs.readFileSync(fileName));

        for (let serviceName of Object.keys(config)) {
            if (!config[serviceName].class) {
                continue;
            }

            this.addService(serviceName, () => {
                const cls = require('../'+config[serviceName].class);
                const args = config[serviceName].arguments || [];

                for (let it = args.length; it >= 0; --it) {
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
                // No support for tag; ignore
                continue;
            }

            this.tagResolvers[tag.name].resolve(this, serviceName, tag);
        }
    }

    close(): Container
    {
        if (this.closed) {
            return;
        }

        for (let it = this.tagsToBeResolved.length - 1; it >= 0; --it) {
            this.tagsToBeResolved[it]();
        }

        this.closed = true;

        return this;
    }
}

let container = new Container();
module.exports = container
    .addService('container', () => {
        // TODO: If possible, remove
        console.log('Injecting the container in any class is frowned upon');
        return container;
    })
    .loadConfigFromFile('config/services/core.json')
    .loadConfigFromFile('config/services/event_listeners.json')
    .loadConfigFromFile('config/services/controllers.json')
    .addTagResolver('kernel.event_listener', container.get('event.listener_tag_resolver'))
    .close()
;
