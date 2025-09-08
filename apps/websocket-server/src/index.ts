import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { setupBattleHandlers } from './battle/battleHandlers';
import { setupLobbyHandlers } from './lobby/lobbyHandlers';

// Configurar variables de entorno
dotenv.config();

// Crear servidor Express
const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// Configurar Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Ruta de health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Manejar conexiones de Socket.IO
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Configurar manejadores de batalla y lobby
  setupBattleHandlers(io, socket);
  setupLobbyHandlers(io, socket);

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});