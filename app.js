const http = require('http');
const port = 3000;

http.createServer((req, res) => {
  res.end('🚀 Hello from Node.js test app!');
}).listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}/`);
});

