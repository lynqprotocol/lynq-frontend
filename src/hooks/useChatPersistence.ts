import { useEffect, useCallback, useRef } from "react";
import { db } from "@/lib/db";
import { useEncryption } from "./useEncryption";
import { useLynqSocket } from "./useLynqSocket";
import { useWallet } from "@solana/wallet-adapter-react";
import { hexToBytes } from "@noble/curves/utils.js";

export const useChatPersistence = (
    socketMessages: any[],
    decryptMessage: (sender: string, pkt: any) => Promise<string>,
    myPublicKey: string | null
) => {
    // Keep track of processed nonces to prevent double-decryption
    const processedNonces = useRef<Set<string>>(new Set());

    // 2. Helper to Save Sent Message
    const saveSentMessage = useCallback(async (recipient: string, content: string, bundle?: string) => {
        const timestamp = Date.now();

        // Check for existing conversation to preserve fields
        const existing = await db.conversations.get(recipient);

        // Update Conversation
        await db.conversations.put({
            walletAddress: recipient,
            lastMessage: content,
            lastMessageTimestamp: timestamp,
            unreadCount: 0, // I read my own message
            // If bundle provided, update it. If not, keep existing.
            publicBundle: bundle || existing?.publicBundle
        });

        // Add Message
        await db.messages.add({
            conversationId: recipient,
            sender: 'me',
            content: content,
            timestamp: timestamp,
            status: 'sent'
        });
    }, []);

    // 3. Helper to Save Received Message (Publicly exposed)
    const saveReceivedMessage = useCallback(async (sender: string, content: string, providedTimestamp?: number) => {
        const timestamp = providedTimestamp || Date.now();
        let finalContent = content;
        let metadata = undefined;

        // Try to parse special message formats (JSON)
        try {
            if (content.trim().startsWith('{')) {
                const parsed = JSON.parse(content);
                if (parsed.type === 'payment') {
                    finalContent = parsed.content || "Payment Received";
                    metadata = {
                        type: 'payment',
                        txSignature: parsed.signature
                    };
                }
            }
        } catch (e) {
            // Not a JSON message, valid plain text
        }

        // Update Conversation
        const conversation = await db.conversations.get(sender);

        await db.conversations.put({
            walletAddress: sender,
            lastMessage: finalContent,
            lastMessageTimestamp: timestamp,
            unreadCount: (conversation?.unreadCount || 0) + 1
        });

        await db.messages.add({
            conversationId: sender,
            sender: 'other',
            content: finalContent,
            timestamp: timestamp,
            status: 'delivered',
            metadata: metadata
        });
    }, []);

    // 1. Handle Incoming Messages from Socket
    useEffect(() => {
        if (!socketMessages.length) return;

        const processMessages = async () => {
            console.log("Processing incoming messages:", socketMessages.length);
            for (const msg of socketMessages) {
                if (msg.nonce && processedNonces.current.has(msg.nonce)) {
                    // Already processed this message
                    continue;
                }
                if (msg.nonce) {
                    processedNonces.current.add(msg.nonce);
                }

                try {
                    if (!msg.ciphertext) {
                        console.warn("Skipping message with no ciphertext", msg);
                        continue;
                    }

                    console.log("Raw incoming ciphertext (hex):", msg.ciphertext);

                    // 1. Parse Wrapper
                    const wrapperJsonStr = new TextDecoder().decode(hexToBytes(msg.ciphertext));
                    const wrapper = JSON.parse(wrapperJsonStr);
                    console.log("Parsed wrapper:", wrapper);

                    const sender = wrapper.senderWallet;

                    if (!sender) {
                        console.warn("Message received without senderWallet in payload wrapper", msg);
                        continue;
                    }

                    // 2. Decrypt
                    console.log("Parsing from sender:", sender);
                    const plaintext = await decryptMessage(sender, msg);
                    console.log("Decrypted successfully:", plaintext);

                    if (plaintext) {
                        // Use the nonce from the message as the timestamp if valid
                        const msgTimestamp = msg.nonce ? parseInt(msg.nonce) : Date.now();

                        // 3. Save
                        const existing = await db.messages
                            .where('conversationId').equals(sender)
                            .and(m => m.timestamp === msgTimestamp && m.content === plaintext)
                            .first();

                        if (!existing) {
                            console.log("Saving new message to DB with timestamp:", msgTimestamp);
                            await saveReceivedMessage(sender, plaintext, msgTimestamp);
                        } else {
                            console.log("Duplicate message ignored");
                        }
                    }

                } catch (e) {
                    console.error("Failed to process incoming message", e);
                }
            }
        };
        processMessages();
    }, [socketMessages, decryptMessage, saveReceivedMessage]);

    const deleteConversation = useCallback(async (wallet: string) => {
        await db.conversations.delete(wallet);
        await db.messages.where('conversationId').equals(wallet).delete();
    }, []);

    return {
        saveSentMessage,
        saveReceivedMessage,
        deleteConversation
    };
};
