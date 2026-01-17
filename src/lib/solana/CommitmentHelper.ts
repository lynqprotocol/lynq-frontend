import {
    Connection,
    PublicKey,
    TransactionInstruction,
    SystemProgram
} from '@solana/web3.js';
import { sha256 } from '@noble/hashes/sha2.js';

export class CommitmentHelper {
    connection: Connection;
    programId: PublicKey;

    constructor(connection: Connection, programId?: string) {
        this.connection = connection;
        // Default to a placeholder, assuming user has deployed it.
        // User should set NEXT_PUBLIC_COMMITMENT_PROGRAM_ID
        this.programId = new PublicKey(programId || process.env.NEXT_PUBLIC_COMMITMENT_PROGRAM_ID || '11111111111111111111111111111111');
    }

    /**
     * Creates an instruction to commit a hashed message on-chain (PDA state).
     * Source: programs/lynq-commitments/src/lib.rs
     */
    async createCommitmentInstruction(
        sender: PublicKey,
        recipient: PublicKey, // Unused in new logic but kept for interface compat
        messageContent: string,
        nonce: string
    ): Promise<TransactionInstruction> {
        // 1. Hash
        const input = new TextEncoder().encode(messageContent + nonce);
        const hash = sha256(input);

        // 2. Data: Just the hash (Borsh serialization of struct { message_hash: [u8;32] })
        const data = Buffer.from(hash);

        // 3. Derive PDA
        const [pda] = PublicKey.findProgramAddressSync(
            [
                new TextEncoder().encode("commitment"),
                sender.toBuffer(),
                hash
            ],
            this.programId
        );

        // 4. Instruction
        return new TransactionInstruction({
            keys: [
                { pubkey: sender, isSigner: true, isWritable: true },
                { pubkey: pda, isSigner: false, isWritable: true },
                { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
            ],
            programId: this.programId,
            data: data
        });
    }

    /**
     * Checks if a commitment exists on-chain via PDA.
     */
    async fetchCommitment(sender: PublicKey, messageContent: string, nonce: string): Promise<boolean> {
        const input = new TextEncoder().encode(messageContent + nonce);
        const hash = sha256(input);

        const [pda] = PublicKey.findProgramAddressSync(
            [
                new TextEncoder().encode("commitment"),
                sender.toBuffer(),
                hash
            ],
            this.programId
        );

        const account = await this.connection.getAccountInfo(pda);
        return account !== null;
    }

    /**
     * Derives the PDA for a specific message commitment.
     */
    getCommitmentPda(sender: PublicKey, messageContent: string, nonce: string): PublicKey {
        const input = new TextEncoder().encode(messageContent + nonce);
        const hash = sha256(input);
        const [pda] = PublicKey.findProgramAddressSync(
            [
                new TextEncoder().encode("commitment"),
                sender.toBuffer(),
                hash
            ],
            this.programId
        );
        return pda;
    }

    /**
     * Helper to compute the hash exactly as the instruction does.
     */
    computeHash(messageContent: string, nonce: string): Uint8Array {
        const input = new TextEncoder().encode(messageContent + nonce);
        return sha256(input);
    }
}
