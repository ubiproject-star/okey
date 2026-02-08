import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

class RedisService {
    private client: Redis;
    private subClient: Redis;

    constructor() {
        this.client = new Redis(REDIS_URL);
        this.subClient = new Redis(REDIS_URL);

        this.client.on('error', (err) => console.error('Redis Client Error', err));
        this.client.on('connect', () => console.log('Redis Client Connected'));
    }

    public getClient() {
        return this.client;
    }

    public getSubClient() {
        return this.subClient;
    }

    // --- Game State Methods (Atomic Operations preferred) ---

    async setGameState(roomId: string, state: any) {
        await this.client.set(`room:${roomId}`, JSON.stringify(state));
        // Set expiry for cleanup (e.g., 2 hours)
        await this.client.expire(`room:${roomId}`, 7200);
    }

    async getGameState(roomId: string) {
        const data = await this.client.get(`room:${roomId}`);
        return data ? JSON.parse(data) : null;
    }

    // --- Matchmaking (Sorted Sets) ---

    async addToQueue(userId: string, score: number) {
        // Add user to sorted set based on score (MMR)
        await this.client.zadd('matchmaking_queue', score, userId);
    }

    async findOpponents(score: number, range: number = 100, count: number = 3): Promise<string[]> {
        // Find players with similar score
        const min = score - range;
        const max = score + range;
        return await this.client.zrangebyscore('matchmaking_queue', min, max, 'LIMIT', 0, count);
    }

    async removeFromQueue(userIds: string[]) {
        if (userIds.length === 0) return;
        await this.client.zrem('matchmaking_queue', ...userIds);
    }

    // --- Session / Active Room Tracking ---

    async setUserActiveRoom(userId: string, roomId: string) {
        await this.client.set(`user:room:${userId}`, roomId);
        await this.client.expire(`user:room:${userId}`, 3600); // 1 hour TTL
    }

    async getUserActiveRoom(userId: string): Promise<string | null> {
        return await this.client.get(`user:room:${userId}`);
    }

    async removeUserActiveRoom(userId: string) {
        await this.client.del(`user:room:${userId}`);
    }

    // --- General Redis Operations ---
    async set(key: string, value: string): Promise<void> {
        await this.client.set(key, value);
    }

    async setex(key: string, seconds: number, value: string): Promise<void> {
        await this.client.setex(key, seconds, value);
    }

    async get(key: string): Promise<string | null> {
        return await this.client.get(key);
    }
}

export const redisService = new RedisService();
