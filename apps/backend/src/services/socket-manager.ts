import { Server } from 'socket.io';

/**
 * Centralized Socket.IO Manager
 * Provides global access to Socket.IO instance for emitting events from anywhere
 */
class SocketManager {
  private io: Server | null = null;

  setIO(io: Server) {
    this.io = io;
    console.log('✅ Socket.IO Manager initialized');
  }

  getIO(): Server {
    if (!this.io) {
      throw new Error('Socket.IO not initialized. Call setIO first.');
    }
    return this.io;
  }

  // Emit to specific user
  emitToUser(userId: string, event: string, data: any) {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit(event, data);
  }

  // Emit to all users
  emitToAll(event: string, data: any) {
    if (!this.io) return;
    this.io.emit(event, data);
  }

  // Check if initialized
  isInitialized(): boolean {
    return this.io !== null;
  }
}

export const socketManager = new SocketManager();
