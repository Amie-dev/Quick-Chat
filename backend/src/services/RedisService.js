import { createClient } from "redis";

class RedisService {
  constructor() {
    this.client = null; // Redis client instance
  }

  // Initialize Redis connection if not already connected
  async initialize() {
    if (this.client) return;
    try {
      this.client = createClient({
        url: process.env.REDIS_URI, // Redis connection string from environment
      });
      this.client.on("error", (error) =>
        console.error("Redis Client error", error),
      );
      await this.client.connect();
      console.log("Redis Connected!");
    } catch (error) {
      console.error("Failed to initialize redis ", error);
    }
  }

  // Disconnect from Redis and clean up client
  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      console.log("Redis Disconnected!");
    }
  }

  // Helper wrapper to safely execute Redis actions
  async _safe(action, fallback = null) {
    if (!this.client) {
      await this.initialize();
      if (!this.client) return fallback; // Return fallback if connection fails
    }

    try {
      return await action;
    } catch (error) {
      console.error("Redis error", error);
      return fallback;
    }
  }

  // Add a user session (socketId) to Redis
  async addUserSession(userId, socketId) {
    await this._safe(async () => {
      const key = `user:${userId}:sessions`;
      await this.client.sAdd(key, socketId); // Add socketId to set
      await this.client.expire(key, 600); // Set TTL of 10 minutes
    });
  }

  // Get the number of active sessions for a user
  async getUserSessionCount(userId) {
    return await this._safe(async () => {
      return this.client.sCard(`user:${userId}:sessions`); // Count set members
    }, 0);
  }

  // Remove a specific user session
  async removeUserSession(userId, socketId) {
    await this._safe(async () => {
      const key = `user:${userId}:sessions`;

      await this.client.sRem(key, socketId); // Remove socketId from set
      const remaining = await this.getUserSessionCount(userId);
      if (remaining === 0) {
        await this.client.del(key); // Delete key if no sessions left
      }
    });
  }

  // Remove all sessions for a user
  async removeAllUserSessions(userId) {
    await this._safe(async () => {
      const key = `user:${userId}:sessions`;
      await this.client.del(key);
    });
  }

  // Check if user is online (has active sessions)
  async isUserOnline(userId) {
    const count = await this.getUserSessionCount(userId);
    return count > 0;
  }
}

export default new RedisService();
