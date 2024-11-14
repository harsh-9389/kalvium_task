const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let currentPage = 1;
let adminId = null;

app.use(express.static('public'));

// WebSocket connection
wss.on('connection', (ws) => {
  // Assign the first connection as admin
  if (!adminId) {
    adminId = ws;
    ws.send(JSON.stringify({ role: 'admin', currentPage }));
  } else {
    ws.send(JSON.stringify({ role: 'viewer', currentPage }));
  }

  // Broadcast page change to all connected clients
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    if (data.type === 'changePage' && ws === adminId) {
      currentPage = data.page;
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'pageUpdate', page: currentPage }));
        }
      });
    }
  });

  // Handle disconnection
  ws.on('close', () => {
    if (ws === adminId) {
      adminId = null;
      // Reassign admin if needed
      for (const client of wss.clients) {
        if (client.readyState === WebSocket.OPEN) {
          adminId = client;
          client.send(JSON.stringify({ role: 'admin', currentPage }));
          break;
        }
      }
    }
  });
});

server.listen(3000, () => {
  console.log('Server is listening on http://localhost:3000');
});
