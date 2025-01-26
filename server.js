const http = require('http');

// Create a simple HTTP server
http.createServer((request, response) => {
  response.writeHead(200, {'Content-Type': 'text/plain'}); // Set response header
  response.end('Welcome to my book club!\n'); // Send a response message
}).listen(8080); // Listen on port 8080

console.log('My first Node test server is running on Port 8080.');
