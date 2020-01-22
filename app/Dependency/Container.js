'use strict';

class Container
{
    services = {};

    get (serviceName) {
        if (!this.services[serviceName]) {
            throw `Unknown service '${serviceName}' requested`;
        }

        if (typeof this.services[serviceName] == 'function') {
            this.services[serviceName] = this.services[serviceName]();
        }

        return this.services[serviceName];
    }
};

let container = new Container();
module.exports = container;

/// Event Dispatcher
container.services['event_dispatcher'] = () => {
    const EventEmitter = require('events');
    let emitter = new EventEmitter;

    emitter.on('kernel.request', container.get('request_listener').handle);

    return emitter;
};

/// Request Listener
container.services['request_listener'] = () => {
    const RequestListener = require('../Event/Listener/RequestListener');

    return new RequestListener;
};
