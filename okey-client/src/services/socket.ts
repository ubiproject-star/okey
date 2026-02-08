import { io, Socket } from 'socket.io-client';


const URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class SocketService {
    public socket: Socket | null = null;

    connect() {
        if (this.socket) return;

        // Auth token logic would go here
        this.socket = io(URL, {
            auth: {
                userId: 'user-' + Math.floor(Math.random() * 1000) // Temporary random ID
            }
        });

        this.socket.on('connect', () => {
            console.log('Connected to server:', this.socket?.id);
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        this.socket.on('connect_error', (err) => {
            console.error('Connection error:', err);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    // Generic emit
    emit(event: string, data?: any) {
        if (this.socket) {
            this.socket.emit(event, data);
        }
    }

    // Generic listen
    on(event: string, callback: (data: any) => void) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    off(event: string, callback?: (data: any) => void) {
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }
}

export const socketService = new SocketService();
