import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as Y from 'yjs';

@WebSocketGateway(3001, {
  cors: {
    origin: '*',
  },
})
export class CollabGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // In-memory document storage per room
  private documents: Map<string, Y.Doc> = new Map();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() room: string,
  ) {
    client.join(room);
    console.log(`Client ${client.id} joined room: ${room}`);

    let doc = this.documents.get(room);
    if (!doc) {
      doc = new Y.Doc();
      this.documents.set(room, doc);
    }

    const stateVector = Y.encodeStateAsUpdate(doc);
    client.emit('sync-update', Buffer.from(stateVector));
  }

  @SubscribeMessage('sync-update')
  handleSyncUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { room: string; update: Uint8Array },
  ) {
    const doc = this.documents.get(payload.room);
    if (doc && payload.update && payload.update.length > 0) {
      Y.applyUpdate(doc, new Uint8Array(payload.update));
      client.to(payload.room).emit('sync-update', payload.update);
    }
  }
}
