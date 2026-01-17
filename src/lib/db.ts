import Dexie, { type EntityTable } from 'dexie';

interface Conversation {
    walletAddress: string; // Primary Key
    lastMessage: string;
    lastMessageTimestamp: number;
    unreadCount: number;
    name?: string; // Optional friendly name
    publicBundle?: string; // Stored JSON bundle for session recovery
}

interface Message {
    id: number; // Auto-incrementing Primary Key
    conversationId: string; // Foreign Key to Conversation.walletAddress
    sender: 'me' | 'other';
    content: string; // Plaintext (after decryption)
    timestamp: number;
    status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
    commitmentSignature?: string; // On-chain verification signature
    metadata?: {
        type: string;
        txSignature?: string;
        isVerified?: boolean; // If true, content is committed on-chain
        verificationSig?: string; // Signature of the commitment transaction
    };
}

const db = new Dexie('LynqDatabase') as Dexie & {
    conversations: EntityTable<Conversation, 'walletAddress'>;
    messages: EntityTable<Message, 'id'>;
};

// Schema Definition
db.version(1).stores({
    conversations: 'walletAddress, lastMessageTimestamp',
    messages: '++id, conversationId, timestamp'
});

export { db };
export type { Conversation, Message };
