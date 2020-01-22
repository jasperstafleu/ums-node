const http = require('http');
const hostname = '0.0.0.0';
const port = process.env.UMS_SERVER_PORT;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello ' + (process.env.GREETING || 'world'));
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
