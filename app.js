const http = require('http');
const port = 3000;

http.createServer((req, res) => {
  res.end('🚀 Hello from Node.js test app!');
}).listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://0.0.0.0:${port}/`);
});
