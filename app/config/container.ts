import Container from "$stafleu/Dependency/Container";

export const container = new Container(require('fs').readFileSync, require);

container
    .loadConfigFromFile('config/services/core.json')
    .loadConfigFromFile('config/services/event_listeners.json')
    .addTagResolver('kernel.event_listener', container.get('event.listener_tag_resolver'))
    .addTagResolver('controller', container.get('controller.tag_resolver'))
    .addTagResolver('param_converter', container.get('param_converter.tag_resolver'))
;
