import { useEffect, useRef, useCallback, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface AuthPayload {
  walletAddress: string;
  nonce: string;
  signature: string;
}

interface MessagePacket {
  destination_wallet: string;
  ephemeral_key: string;
  ciphertext: string;
  nonce: string;
  timestamp?: number;
  // Extra fields for offline messages
  offline_id?: number;
  requireAck?: boolean;
}

export const useLynqSocket = (authSignature: string | null, authMessage?: string) => {
  const { publicKey } = useWallet();
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<MessagePacket[]>([]);

  useEffect(() => {
    // Only connect if we have a publicKey and a signature
    if (!publicKey || !authSignature) {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      return;
    }

    // prevent multiple connections if signature changes quickly or strict mode
    // connectionManager handles replacement, but good to check local state
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const ws = new WebSocket(process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8080');
    socketRef.current = ws;

    ws.onopen = () => {
      console.log('WS Connected');
      setIsConnected(true);

      // AUTH
      const payload: AuthPayload = {
        walletAddress: publicKey.toBase58(),
        nonce: authMessage || "Login to Lynq", // Must match the logic in server/auth
        signature: authSignature,
      };

      ws.send(JSON.stringify({
        type: 'AUTH',
        payload
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string);

        if (data.type === 'INCOMING_MSG') {
          const packet = data.payload as MessagePacket;
          console.log('Received MSG:', packet);

          // Add to local state (optional, for UI)
          setMessages((prev) => [...prev, packet]);

          // ACK if required (offline messages)
          // The server logic sends 'offline_id' for offline messages.
          // Using strict existence check for offline_id
          if (packet.offline_id !== undefined) {
            console.log('Sending ACK for msg:', packet.offline_id);
            ws.send(JSON.stringify({
              type: 'MSG_ACK',
              payload: {
                messageIds: [packet.offline_id]
              }
            }));
          }
        } else if (data.type === 'AUTH_SUCCESS') {
          console.log('Auth Success:', data.socketId);
        } else if (data.type === 'ERROR') {
          console.error('Socket Error:', data.message);
        }
      } catch (e) {
        console.error('Error parsing WS message', e);
      }
    };

    ws.onclose = () => {
      console.log('WS Disconnected');
      setIsConnected(false);
      // Don't nullify if we are just re-connecting? 
      // Actually strictly we should.
      if (socketRef.current === ws) {
        socketRef.current = null;
      }
    };

    return () => {
      console.log("Cleaning up WebSocket effect");
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
      if (socketRef.current === ws) {
        socketRef.current = null;
      }
    };
  }, [publicKey, authSignature, authMessage]);

  const sendMessage = useCallback((to: string, content: string | { ciphertext: string, ephemeralKey?: string, nonce?: string }) => {
    console.log('sendMessage called. Socket readyState:', socketRef.current?.readyState);
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.warn("Cannot send message: Socket not open");
      return;
    }

    let packet: MessagePacket;

    if (typeof content === 'string') {
      const packet: MessagePacket = {
        destination_wallet: to,
        ephemeral_key: "dummy_ephem_key",
        ciphertext: Buffer.from(content).toString('hex'),
        nonce: "dummy_nonce_123",
        timestamp: Date.now()
      };
      socketRef.current.send(JSON.stringify({ type: 'SEND_MSG', payload: packet }));
    } else {
      // Advanced mode (encrypted)
      packet = {
        destination_wallet: to,
        ephemeral_key: content.ephemeralKey || "dummy_ephem_key",
        ciphertext: content.ciphertext,
        nonce: content.nonce || "dummy_nonce_123",
        timestamp: Date.now()
      };
      socketRef.current.send(JSON.stringify({ type: 'SEND_MSG', payload: packet }));
    }
  }, [isConnected]); // Depend on isConnected to refresh closure if needed, though ref should work.

  return {
    isConnected,
    sendMessage,
    messages
  };
};
