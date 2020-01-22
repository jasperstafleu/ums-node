const http = require('http');
const container = require('./Dependency/Container');
const RequestEvent = require('./Event/Event/RequestEvent');

const server = http.createServer((request, response) => {
  container.get('event_dispatcher').emit('kernel.request', new RequestEvent(request, response));
});

server.listen(process.env.UMS_SERVER_PORT, process.env.UMS_HOSTNAME, () => {
  console.log(`Server running at http://${process.env.UMS_HOSTNAME}:${process.env.UMS_SERVER_PORT}/`);
});
