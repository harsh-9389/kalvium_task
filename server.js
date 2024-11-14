const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const bodyParser = require('body-parser');

let currentPage = 1;
let adminId = null;
let currentPDFData = null; // Store the uploaded PDF data

app.use(express.static('public'));
app.use(bodyParser.json({ limit: '50mb' })); // Support large PDF data payloads

// Endpoint for admin to upload PDF
app.post('/upload-pdf', (req, res) => {
  if (!req.body.pdfData) {
    return res.status(400).send('No PDF data provided');
  }

  currentPDFData = req.body.pdfData; // Store PDF data in memory
  currentPage = 1; // Reset to the first page on new upload

  // Broadcast the new PDF to all connected clients
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'loadPDF', pdfData: currentPDFData, page: currentPage }));
    }
  });

  res.sendStatus(200);
});

// WebSocket connection
wss.on('connection', (ws) => {
  console.log('New client connected');
  // Assign the first client as admin if no admin exists
  if (!adminId) {
    adminId = ws;
    ws.send(JSON.stringify({ role: 'admin', pdfData: currentPDFData, page: currentPage }));
    console.log('Assigned admin role to the connected client');
  } else {
    ws.send(JSON.stringify({ role: 'viewer', pdfData: currentPDFData, page: currentPage }));
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
    console.log('client Disconnected')
    if (ws === adminId) {
      adminId = null;
      console.log('Admin disconnected')
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
