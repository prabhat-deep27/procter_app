// Lightweight STOMP client wrapper using SockJS for Spring STOMP endpoints
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export function createStompClient({ onConnect, onDisconnect, onError } = {}) {
  const client = new Client({
    webSocketFactory: () => new SockJS('/ws'),
    reconnectDelay: 2000,
    debug: () => {},
    onConnect: frame => {
      if (onConnect) onConnect(frame, client);
    },
    onStompError: frame => {
      if (onError) onError(frame);
    },
    onWebSocketClose: () => {
      if (onDisconnect) onDisconnect();
    }
  });
  return client;
}

export function subscribeToTestEvents(client, testId, handler) {
  if (!client || !client.active) return null;
  return client.subscribe(`/topic/test/${testId}/events`, message => {
    try {
      const body = JSON.parse(message.body);
      handler(body);
    } catch (_) {
      // ignore malformed
    }
  });
}

export function sendActivity(client, testId, payload) {
  if (!client || !client.connected) return;
  client.publish({
    destination: `/app/test/${testId}/activity`,
    body: JSON.stringify(payload)
  });
}


