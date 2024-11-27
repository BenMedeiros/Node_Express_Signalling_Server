const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Store connected clients
const clients = {};

io.on('connection', (socket) => {
    console.log('A user connected: ' + socket.id);

    // Store the socket id
    clients[socket.id] = socket;

    // Listen for offer from client
    socket.on('offer', (data) => {
        console.log('Sending offer to: ' + data.target);
        clients[data.target].emit('offer', {
            sdp: data.sdp,
            from: socket.id
        });
    });

    // Listen for answer from client
    socket.on('answer', (data) => {
        console.log('Sending answer to: ' + data.target);
        clients[data.target].emit('answer', {
            sdp: data.sdp,
            from: socket.id
        });
    });

    // Listen for ICE candidates from client
    socket.on('ice-candidate', (data) => {
        console.log('Sending ICE candidate to: ' + data.target);
        clients[data.target].emit('ice-candidate', {
            candidate: data.candidate,
            from: socket.id
        });
    });

    // Handle client disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected: ' + socket.id);
        delete clients[socket.id];
    });
});

server.listen(PORT, () => {
    console.log(`Signaling server running on http://localhost:${PORT}`);
});