import { useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { CommitmentHelper } from '@/lib/solana/CommitmentHelper';
import { Message } from '@/lib/db';

export const useMessageCommitment = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const commitMessage = useCallback(async (message: Message) => {
        if (!publicKey) throw new Error("Wallet not connected");
        if (!message.content) throw new Error("Message content empty");

        // Initialize helper
        // Ideally we might cache this instance or pass program ID from env
        const helper = new CommitmentHelper(connection);

        // Prepare Recipient
        // 'conversationId' in Message is the wallet address of the recipient (when sender='me')
        // Verify it is a valid key
        let recipientKey: PublicKey;
        try {
            recipientKey = new PublicKey(message.conversationId);
        } catch (e) {
            throw new Error("Invalid recipient wallet address in message");
        }

        // Use message timestamp or ID as nonce? 
        // The user request says "message object which contains content, nonce..."
        // Our DB Message interface usually has 'timestamp'. 
        // If 'nonce' is missing from the interface, we'll use timestamp.
        // Assuming strict compliance with user request implying 'nonce' might be in the object passed at runtime
        // or we derive it.
        // Let's coerce strict typing: message as any, or update interface?
        // Let's use timestamp as nonce if explicit nonce is missing.
        const nonce = (message as any).nonce || message.timestamp.toString();

        console.log("Committing message:", message.id);
        console.log("Nonce used:", nonce);

        // Build Instruction
        const ix = await helper.createCommitmentInstruction(
            publicKey, // Sender
            recipientKey,
            message.content,
            nonce
        );

        // Send Transaction
        const transaction = new Transaction().add(ix);

        // Let's set latest blockhash for better reliability
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = publicKey;

        const signature = await sendTransaction(transaction, connection);

        // Confirm
        await connection.confirmTransaction({
            signature,
            blockhash,
            lastValidBlockHeight
        }, 'confirmed');

        return signature;

    }, [connection, publicKey, sendTransaction]);

    const verifyMessage = useCallback(async (message: Message) => {
        if (!publicKey) {
            console.log("Verify: No wallet connected");
            return false;
        }
        const helper = new CommitmentHelper(connection);
        const nonce = (message as any).nonce || message.timestamp.toString();

        let senderKey: PublicKey;
        if (message.sender === 'me') {
            senderKey = publicKey;
        } else {
            console.log("Verify: Sender is other. ConversationId:", message.conversationId);
            try {
                senderKey = new PublicKey(message.conversationId);
            } catch (e) {
                console.error("Verify: Invalid key from conversationId", e);
                return false;
            }
        }

        console.log("Verify: Checking PDA for Sender:", senderKey.toBase58(), "Hash Input:", message.content + nonce);
        const exists = await helper.fetchCommitment(senderKey, message.content, nonce);
        console.log("Verify: Exists?", exists);
        return exists;
    }, [connection, publicKey]);

    const getCommitmentAddress = useCallback((message: Message) => {
        if (!publicKey) return null;
        const helper = new CommitmentHelper(connection);
        const nonce = (message as any).nonce || message.timestamp.toString();

        let senderKey: PublicKey;
        if (message.sender === 'me') {
            senderKey = publicKey;
        } else {
            // For received messages, conversationId is the sender's wallet address
            try {
                senderKey = new PublicKey(message.conversationId);
            } catch {
                return null;
            }
        }

        return helper.getCommitmentPda(senderKey, message.content, nonce).toBase58();
    }, [connection, publicKey]);

    return {
        commitMessage,
        verifyMessage,
        getCommitmentAddress
    };
};
