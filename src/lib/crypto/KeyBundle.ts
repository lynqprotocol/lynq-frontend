import { ed25519, x25519 } from '@noble/curves/ed25519.js';
import { hkdf } from '@noble/hashes/hkdf.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex, hexToBytes } from '@noble/curves/utils.js';

export interface PreKeyBundlePublic {
    identityKey: Uint8Array; // Ed25519 Public Key
    identityDHKey: Uint8Array; // X25519 Public Key (for DH)
    identityDHKeySignature: Uint8Array; // Signature of identityDHKey by identityKey
    signedPreKey: {
        key: Uint8Array; // X25519 Public Key
        signature: Uint8Array; // Ed25519 Signature
    };
    oneTimePreKey?: {
        id: number;
        key: Uint8Array; // X25519 Public Key
    };
}

export function serializePublicBundle(bundle: PreKeyBundlePublic): any {
    return {
        identityKey: bytesToHex(bundle.identityKey),
        identityDHKey: bytesToHex(bundle.identityDHKey),
        identityDHKeySignature: bytesToHex(bundle.identityDHKeySignature),
        signedPreKey: {
            key: bytesToHex(bundle.signedPreKey.key),
            signature: bytesToHex(bundle.signedPreKey.signature),
        },
        oneTimePreKey: bundle.oneTimePreKey ? {
            id: bundle.oneTimePreKey.id,
            key: bytesToHex(bundle.oneTimePreKey.key)
        } : undefined
    };
}

export function deserializePublicBundle(json: any): PreKeyBundlePublic {
    // Basic validation
    if (!json.identityKey || !json.identityDHKey) throw new Error("Invalid Bundle JSON");

    return {
        identityKey: hexToBytes(json.identityKey),
        identityDHKey: hexToBytes(json.identityDHKey),
        identityDHKeySignature: hexToBytes(json.identityDHKeySignature),
        signedPreKey: {
            key: hexToBytes(json.signedPreKey.key),
            signature: hexToBytes(json.signedPreKey.signature),
        },
        oneTimePreKey: json.oneTimePreKey ? {
            id: json.oneTimePreKey.id,
            key: hexToBytes(json.oneTimePreKey.key)
        } : undefined
    }
}

export class KeyBundle {
    // Long-term Identity Key (Ed25519) - Used for Signing
    public readonly identityKey: { private: Uint8Array; public: Uint8Array };

    // Long-term Identity DH Key (X25519) - Used for X3DH
    public readonly identityDHKey: { private: Uint8Array; public: Uint8Array };
    public readonly identityDHKeySignature: Uint8Array;

    // Signed PreKey (Mid-term X25519)
    public readonly signedPreKey: { private: Uint8Array; public: Uint8Array };
    public readonly signedPreKeySignature: Uint8Array;

    // One-Time PreKeys (Ephemeral X25519)
    public readonly oneTimePreKeys: { id: number; private: Uint8Array; public: Uint8Array }[];

    constructor() {
        // 1. Generate Identity Key (Ed25519)
        const ikPriv = ed25519.utils.randomSecretKey();
        const ikPub = ed25519.getPublicKey(ikPriv);
        this.identityKey = { private: ikPriv, public: ikPub };

        // 2. Generate Identity DH Key (X25519)
        const idhPriv = x25519.utils.randomSecretKey();
        const idhPub = x25519.getPublicKey(idhPriv);
        this.identityDHKey = { private: idhPriv, public: idhPub };

        // Sign the AH Identity Key with the Signing Identity Key
        this.identityDHKeySignature = ed25519.sign(idhPub, ikPriv);

        // 3. Generate Signed PreKey (X25519)
        const spkPriv = x25519.utils.randomSecretKey();
        const spkPub = x25519.getPublicKey(spkPriv);
        this.signedPreKey = { private: spkPriv, public: spkPub };

        // Sign the SPK with the Signing Identity Key
        this.signedPreKeySignature = ed25519.sign(spkPub, ikPriv);

        // 4. Generate One-Time PreKeys
        this.oneTimePreKeys = [];
        for (let i = 0; i < 5; i++) {
            const opkPriv = x25519.utils.randomSecretKey();
            const opkPub = x25519.getPublicKey(opkPriv);
            this.oneTimePreKeys.push({ id: i, private: opkPriv, public: opkPub });
        }
    }

    getPublicBundle(oneTimeKeyId?: number): PreKeyBundlePublic {
        let opkChunk;
        if (oneTimeKeyId !== undefined) {
            const opk = this.oneTimePreKeys.find(k => k.id === oneTimeKeyId);
            if (opk) {
                opkChunk = { id: opk.id, key: opk.public };
            }
        } else if (this.oneTimePreKeys.length > 0) {
            const opk = this.oneTimePreKeys[0];
            opkChunk = { id: opk.id, key: opk.public };
        }

        return {
            identityKey: this.identityKey.public,
            identityDHKey: this.identityDHKey.public,
            identityDHKeySignature: this.identityDHKeySignature,
            signedPreKey: {
                key: this.signedPreKey.public,
                signature: this.signedPreKeySignature,
            },
            oneTimePreKey: opkChunk,
        };
    }

    static verifyBundle(bundle: PreKeyBundlePublic): boolean {
        const validIDH = ed25519.verify(bundle.identityDHKeySignature, bundle.identityDHKey, bundle.identityKey);
        if (!validIDH) return false;

        const validSPK = ed25519.verify(bundle.signedPreKey.signature, bundle.signedPreKey.key, bundle.identityKey);
        return validSPK;
    }
}

export function x3dhInitiate(
    senderIdentityDHKey: { private: Uint8Array, public: Uint8Array },
    recipientBundle: PreKeyBundlePublic,
    recipientIdentityDHKeySignature: Uint8Array
): { sharedSecret: Uint8Array, ephemeralPublicKey: Uint8Array } {

    // Verify signatures
    if (!ed25519.verify(recipientBundle.identityDHKeySignature, recipientBundle.identityDHKey, recipientBundle.identityKey)) {
        throw new Error("Recipient Identity DH Key signature invalid");
    }
    if (!ed25519.verify(recipientBundle.signedPreKey.signature, recipientBundle.signedPreKey.key, recipientBundle.identityKey)) {
        throw new Error("Recipient Signed PreKey signature invalid");
    }

    // Generate Ephemeral Key
    const ekPriv = x25519.utils.randomSecretKey();
    const ekPub = x25519.getPublicKey(ekPriv);

    const IK_A = senderIdentityDHKey.private;
    const SPK_B = recipientBundle.signedPreKey.key;
    const IK_B = recipientBundle.identityDHKey;
    const OPK_B = recipientBundle.oneTimePreKey?.key;

    // DH1 = DH(IK_A, SPK_B)
    const dh1 = x25519.getSharedSecret(IK_A, SPK_B);

    // DH2 = DH(EK_A, IK_B)
    const dh2 = x25519.getSharedSecret(ekPriv, IK_B);

    // DH3 = DH(EK_A, SPK_B)
    const dh3 = x25519.getSharedSecret(ekPriv, SPK_B);

    let dh4 = new Uint8Array(0);
    if (OPK_B) {
        // DH4 = DH(EK_A, OPK_B)
        dh4 = x25519.getSharedSecret(ekPriv, OPK_B) as any;
    }

    const inputKeyMaterial = new Uint8Array(dh1.length + dh2.length + dh3.length + dh4.length);
    inputKeyMaterial.set(dh1, 0);
    inputKeyMaterial.set(dh2, dh1.length);
    inputKeyMaterial.set(dh3, dh1.length + dh2.length);
    if (OPK_B) {
        inputKeyMaterial.set(dh4, dh1.length + dh2.length + dh3.length);
    }

    const info = new TextEncoder().encode('Lynq X3DH');
    const sharedSecret = hkdf(sha256, inputKeyMaterial, undefined, info, 32);

    return { sharedSecret, ephemeralPublicKey: ekPub };
}

export function x3dhReceive(
    recipientBundle: KeyBundle,
    senderIdentityDHKeyPublic: Uint8Array,
    ephemeralKeyPublic: Uint8Array,
    usedOneTimeKeyId?: number
): Uint8Array {

    const IK_A = senderIdentityDHKeyPublic;
    const EK_A = ephemeralKeyPublic;

    const IK_B_Priv = recipientBundle.identityDHKey.private;
    const SPK_B_Priv = recipientBundle.signedPreKey.private;

    const dh1 = x25519.getSharedSecret(SPK_B_Priv, IK_A);
    const dh2 = x25519.getSharedSecret(IK_B_Priv, EK_A);
    const dh3 = x25519.getSharedSecret(SPK_B_Priv, EK_A);

    let dh4 = new Uint8Array(0);
    if (usedOneTimeKeyId !== undefined) {
        const opk = recipientBundle.oneTimePreKeys.find(k => k.id === usedOneTimeKeyId);
        if (!opk) throw new Error("One Time Key not found or already deleted");

        const dh4Val = x25519.getSharedSecret(opk.private, EK_A) as any;
        dh4 = dh4Val;
    }

    const inputKeyMaterial = new Uint8Array(dh1.length + dh2.length + dh3.length + dh4.length);
    inputKeyMaterial.set(dh1, 0);
    inputKeyMaterial.set(dh2, dh1.length);
    inputKeyMaterial.set(dh3, dh1.length + dh2.length);
    if (usedOneTimeKeyId !== undefined) {
        inputKeyMaterial.set(dh4, dh1.length + dh2.length + dh3.length);
    }

    const info = new TextEncoder().encode('Lynq X3DH');
    const sharedSecret = hkdf(sha256, inputKeyMaterial, undefined, info, 32);
    return sharedSecret;
}
