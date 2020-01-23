'use strict';

class Container
{
    private services = {};

    get (serviceName: string): any {
        if (!this.services[serviceName]) {
            throw `Unknown service '${serviceName}' requested`;
        }

        if (typeof this.services[serviceName] == 'function') {
            this.services[serviceName] = this.services[serviceName]();
        }

        return this.services[serviceName];
    }

    addService(serviceName: string, callback: () => any): Container
    {
        this.services[serviceName] = callback;

        return this;
    }
}

let container = new Container();
module.exports = container // ; omitted by design

/// Kernel
.addService('kernel', () => {
    const Kernel = require('../Kernel');
    return new Kernel(
        container.get('event_emitter'),
        container.get('controller_resolver')
    );
})


/// Event Dispatcher
.addService('event_emitter', () => {
    const EventEmitter = require('events');
    let emitter = new EventEmitter;

    emitter.on('kernel.request', container.get('request_listener').handle);

    return emitter;
})

/// Controller resolver
.addService('controller_resolver', () => {
    return {};
})

/// Request Listener
.addService('request_listener', () => {
    const RequestListener = require('../Event/Listener/RequestListener');
    return new RequestListener;
})

;
