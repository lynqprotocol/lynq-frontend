import {
    Connection,
    PublicKey,
    TransactionInstruction,
    Keypair,
    SystemProgram,
} from '@solana/web3.js';
import {
    TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';

export interface ConfidentialTransferProofs {
    encryptedAmount: Uint8Array;
    newSourceDecryptableAmount: Uint8Array;
    newAuditorDecryptableAmount: Uint8Array;
    transferProofData: Uint8Array;
}

export class ConfidentialPaymentHelper {
    connection: Connection;

    constructor(rpcUrl: string) {
        this.connection = new Connection(rpcUrl, 'confirmed');
    }

    async createConfidentialTransferInstruction(
        sourceAccount: PublicKey,
        destinationAccount: PublicKey,
        mint: PublicKey,
        proofs: ConfidentialTransferProofs,
        authority: PublicKey,
        multiSigners: Keypair[] = []
    ): Promise<TransactionInstruction> {

        if (proofs.encryptedAmount.length !== 64) {
            throw new Error(`Invalid Encrypted Amount length. Expected 64, got ${proofs.encryptedAmount.length}`);
        }

        if (!proofs.transferProofData || proofs.transferProofData.length === 0) {
            throw new Error("Transfer Proof Data is missing or empty.");
        }

        console.log("Constructing Confidential Transfer Instruction");

        const dataParts = [
            new Uint8Array([26]), // Extension Discriminator
            new Uint8Array([2]),  // Confidential Transfer
            proofs.encryptedAmount,
            proofs.transferProofData
        ];

        if (proofs.newSourceDecryptableAmount && proofs.newSourceDecryptableAmount.length === 64) {
            dataParts.push(proofs.newSourceDecryptableAmount);
        }

        if (proofs.newAuditorDecryptableAmount && proofs.newAuditorDecryptableAmount.length === 64) {
            dataParts.push(proofs.newAuditorDecryptableAmount);
        }

        const totalLength = dataParts.reduce((acc, part) => acc + part.length, 0);
        const data = new Uint8Array(totalLength);
        let offset = 0;
        for (const part of dataParts) {
            data.set(part, offset);
            offset += part.length;
        }

        const keys = [
            { pubkey: sourceAccount, isSigner: false, isWritable: true },
            { pubkey: destinationAccount, isSigner: false, isWritable: true },
            { pubkey: mint, isSigner: false, isWritable: false },
            { pubkey: authority, isSigner: true, isWritable: false },
        ];

        for (const signer of multiSigners) {
            keys.push({ pubkey: signer.publicKey, isSigner: true, isWritable: false });
        }

        return new TransactionInstruction({
            keys,
            programId: TOKEN_2022_PROGRAM_ID,
            data: Buffer.from(data) // Web3.js still often expects Buffer or compatible
        });
    }
}
