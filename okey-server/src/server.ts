import Fastify from 'fastify';
import cors from '@fastify/cors';
import { Server } from 'socket.io';
import { GameManager } from './game/GameManager';
import dotenv from 'dotenv';
import { createServer } from 'http';

dotenv.config();

const port = parseInt(process.env.PORT || '3000', 10);
const fastify = Fastify({ logger: true });

// Enable CORS
fastify.register(cors, {
    origin: '*', // Allow all for dev, restrict in prod
});

// Create HTTP server for Socket.io
const httpServer = createServer(fastify.server);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Initialize Game Manager
const gameManager = new GameManager(io);
gameManager.start(); // Ensure GameManager is started

// Basic Health Check
fastify.get('/', async (request, reply) => {
    return { status: 'ok', server: 'Okey Backend', users: io.engine.clientsCount };
});

// Start Server
const start = async () => {
    try {
        await fastify.ready();
        httpServer.listen(port, '0.0.0.0', () => {
            console.log(`Server running on http://localhost:${port}`);
        });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
