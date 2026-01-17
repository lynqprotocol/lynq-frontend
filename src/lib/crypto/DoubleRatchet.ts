import { x25519 } from '@noble/curves/ed25519.js';
import { hkdf } from '@noble/hashes/hkdf.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { hmac } from '@noble/hashes/hmac.js';
import { bytesToHex, hexToBytes, concatBytes } from '@noble/curves/utils.js';

// Constants
const KDF_RK_INFO = new TextEncoder().encode('Lynq Root Key KDF');
const KDF_CK_INFO = new TextEncoder().encode('Lynq Chain Key KDF');
const EMPTY_BYTE = new Uint8Array(0);

export interface RatchetHeader {
    publicKey: Uint8Array; // The sender's current ratchet public key
    pn: number; // Number of messages in previous chain
    n: number; // Number of messages in current chain
}

export interface EncryptedMessage {
    header: RatchetHeader;
    ciphertext: Uint8Array; // AES-GCM ciphertext (including auth tag if appended)
}

// Helper: Random Bytes (Web Crypto)
function randomBytes(count: number): Uint8Array {
    return window.crypto.getRandomValues(new Uint8Array(count));
}

// Helper: AES-256-GCM Encryption (Web Crypto)
async function aesEncrypt(key: Uint8Array, plaintext: string | Uint8Array, associatedData: Uint8Array): Promise<Uint8Array> {
    const iv = randomBytes(12); // Standard GCM IV size
    console.log('iv', bytesToHex(iv));
    const alg = { name: 'AES-GCM', iv, additionalData: associatedData };
    console.log('alg', alg);
    const keyObj = await window.crypto.subtle.importKey('raw', key as any, 'AES-GCM', false, ['encrypt']);
    // console.log('keyObj', keyObj);

    const ptBytes = typeof plaintext === 'string' ? new TextEncoder().encode(plaintext) : plaintext;
    console.log('ptBytes', bytesToHex(ptBytes));
    // Cast ptBytes to any to avoid TypeScript/WebCrypto BufferSource mismatch issues 
    const ctBuffer = await window.crypto.subtle.encrypt(alg, keyObj, ptBytes as any);
    console.log('ctBuffer', bytesToHex(new Uint8Array(ctBuffer)));

    // Web Crypto 'ciphertext' includes the authentication tag at the end.
    // Result: IV (12) + Ciphertext + Tag
    const res = new Uint8Array(iv.length + ctBuffer.byteLength);
    res.set(iv);
    res.set(new Uint8Array(ctBuffer), iv.length);
    console.log('res', bytesToHex(res));
    return res;
}

// Helper: AES-256-GCM Decryption (Web Crypto)
async function aesDecrypt(key: Uint8Array, data: Uint8Array, associatedData: Uint8Array): Promise<Uint8Array> {
    if (data.length < 12) throw new Error("Data too short");
    const iv = data.slice(0, 12);
    console.log('iv', bytesToHex(iv));
    const ciphertext = data.slice(12); // Contains Ciphertext + Tag
    console.log('ciphertext', bytesToHex(ciphertext));

    const alg = { name: 'AES-GCM', iv, additionalData: associatedData };
    console.log('alg', alg);
    const keyObj = await window.crypto.subtle.importKey('raw', key as any, 'AES-GCM', false, ['decrypt']);
    console.log('keyObj', keyObj);

    try {
        const ptBuffer = await window.crypto.subtle.decrypt(alg, keyObj, ciphertext as any);
        console.log('ptBuffer', bytesToHex(new Uint8Array(ptBuffer)));
        return new Uint8Array(ptBuffer);
    } catch (e) {
        console.log('e', e);
        throw new Error("Decryption failed");
    }
}

export class SessionManager {
    // State Variables
    private rootKey: Uint8Array;
    private chainKeySend: Uint8Array | null = null;
    private chainKeyRecv: Uint8Array | null = null;

    private myRatchetKey: { private: Uint8Array, public: Uint8Array };
    private remoteRatchetKey: Uint8Array | null = null;

    private ns: number = 0; // Sending message number
    private nr: number = 0; // Receiving message number
    private pn: number = 0; // Previous chain length

    // In a real DB-backed implementation, we'd store skipped keys 
    // for out-of-order delivery.
    private skippedMessageKeys: Map<string, Uint8Array> = new Map();
    private MAX_SKIP = 20;

    constructor(
        sharedSecret: Uint8Array,
        role: 'initiator' | 'responder',
        remoteRatchetKey?: Uint8Array, // For Alice, this is Bob's INITIAL public key (SPK/OPK)
        myInitialRatchetKey?: { private: Uint8Array, public: Uint8Array } // Optional: Force a keypair (for testing)
    ) {
        // Initialize Root Key
        this.rootKey = sharedSecret;

        // Create Key Pair
        if (myInitialRatchetKey) {
            this.myRatchetKey = myInitialRatchetKey;
        } else {
            const priv = x25519.utils.randomSecretKey();
            const pub = x25519.getPublicKey(priv);
            this.myRatchetKey = { private: priv, public: pub };
        }

        if (role === 'initiator') {
            // Alice
            if (!remoteRatchetKey) throw new Error("Initiator requires remote (Bob's) public key");
            this.remoteRatchetKey = remoteRatchetKey;

            // Alice performs the first DH Ratchet step immediately
            // DH(Alice_Priv, Bob_Pub)
            const dhOut = x25519.getSharedSecret(this.myRatchetKey.private, this.remoteRatchetKey);
            const [newRoot, newSendChain] = this.kdfRK(this.rootKey, dhOut);
            this.rootKey = newRoot;
            this.chainKeySend = newSendChain;
            // chainKeyRecv is null roughly until Bob replies?
            // Actually in X3DH/Double Ratchet specs, initialization is complex.
            // Simplified: Alice sets up Sending Chain.
        } else {
            // Responder (Bob)
            // Bob knows SK. Bob waits for Alice's first message to ratchet.
            // Bob's "myRatchetKey" should match the key Alice thinks he has?
            // If Alice used Bob's SPK as "Remote Key", Bob must have that SPK private key "active" or...
            // Actually, in X3DH, the SK implies the handshake is done.
            // Typical DR: 
            // Alice sends with her header. Bob reads header. Bob sees new key.
            // So Bob starts with just SK.
            // But Bob must have the private key corresponding to what Alice used?
            // Let's assume passed sharedSecret includes context.
            // For simplicity in this logical layer: Bob's initial state is just RootKey.
            // remoteRatchetKey is null.
            this.chainKeySend = null;
            this.chainKeyRecv = null;
            this.remoteRatchetKey = null; // Will learn from header
        }
    }

    // KDF for Root Key Chain: input [RK, DH_out] -> output [New RK, New CK]
    private kdfRK(rk: Uint8Array, dhOut: Uint8Array): [Uint8Array, Uint8Array] {
        // Simple HKDF: Salt=RK, IKM=dhOut. Or Salt=0? 
        // Spec usually: KDF(RK, DH_OUT)
        // Using HKDF extract and expand.
        const input = dhOut;
        const salt = rk;
        const prk = hkdf(sha256, input, salt, KDF_RK_INFO, 64); // Need 64 bytes (32 for RK, 32 for CK)
        const newRK = prk.slice(0, 32);
        const newCK = prk.slice(32, 64);
        return [newRK, newCK];
    }

    // KDF for Chain Key: input [CK] -> output [New CK, MK]
    private kdfCK(ck: Uint8Array): [Uint8Array, Uint8Array] {
        // HMAC-SHA256
        // MK = HMAC(CK, "1")
        // NewCK = HMAC(CK, "2")
        const mkInput = new Uint8Array([1]);
        const ckInput = new Uint8Array([2]);

        const mk = hmac(sha256, ck, mkInput);
        const newCK = hmac(sha256, ck, ckInput);

        return [newCK, mk];
    }

    public async encrypt(message: string | Uint8Array): Promise<EncryptedMessage> {
        if (!this.chainKeySend) {
            // Should happen if we need to initialize a ratchet but haven't?
            // For initiator, initialized in constructor.
            // For responder, initialized upon receiving first message?
            // If responder wants to send first? Should not happen in X3DH flow (Alice speaks first).
            // But if Bob speaks, he needs to ratchet?
            // Let's assume Strict Alice-First for simplicity or auto-ratchet.
            if (this.remoteRatchetKey) {
                // Try to initialize?
                const dhOut = x25519.getSharedSecret(this.myRatchetKey.private, this.remoteRatchetKey);
                const [newRoot, newSendChain] = this.kdfRK(this.rootKey, dhOut);
                this.rootKey = newRoot;
                this.chainKeySend = newSendChain;
            } else {
                throw new Error("Cannot encrypt: No Send Chain and no known Remote Key to ratchet with.");
            }
        }

        const [newCKs, mk] = this.kdfCK(this.chainKeySend!);
        this.chainKeySend = newCKs; // Delete old chain key (property of Forward Secrecy)

        const header: RatchetHeader = {
            publicKey: this.myRatchetKey.public,
            pn: this.pn,
            n: this.ns
        };

        this.ns++;

        console.log('--------- DoubleRatchet encrypt ---------');
        console.log('rootKey', bytesToHex(this.rootKey));
        console.log('chainKeySend', bytesToHex(this.chainKeySend));
        console.log('header', header);
        // Serialize header to use as Associated Data
        const ad = this.encodeHeader(header);
        console.log("Encryption AD (Sender):", new TextDecoder().decode(ad));
        console.log("Encryption MK (Sender):", bytesToHex(mk));
        const ciphertext = await aesEncrypt(mk, message, ad);
        console.log("Encryption Ciphertext (Sender):", bytesToHex(ciphertext));
        console.log('--------- DoubleRatchet encrypt ---------');

        return { header, ciphertext };
    }

    private async trySkippedMessageKeys(header: RatchetHeader, ciphertext: Uint8Array, ad: Uint8Array): Promise<Uint8Array | null> {
        const keyId = bytesToHex(header.publicKey) + '_' + header.n;
        if (this.skippedMessageKeys.has(keyId)) {
            const mk = this.skippedMessageKeys.get(keyId)!;
            this.skippedMessageKeys.delete(keyId);
            return await aesDecrypt(mk, ciphertext, ad);
        }
        return null;
    }

    private async skipMessageKeys(until: number) {
        if (!this.chainKeyRecv) return;

        if (this.nr + this.MAX_SKIP < until) {
            throw new Error("Too many skipped messages");
        }

        while (this.nr < until) {
            const [nextCKr, mk] = this.kdfCK(this.chainKeyRecv!);
            this.chainKeyRecv = nextCKr;
            // Store skipped key
            // Key ID generally depends on the associated Ratchet Key.
            // If we are in this function, we simply use the CURRENT remote ratchet key context.
            // Note: If we just rotated remoteRatchetKey, we might need the OLD one? 
            // In typical logic, 'skipMessageKeys' is called on the *current* chain before rotating, OR on the current chain if not rotating.
            // Since we store keys indexed by (PublicKey, N), we need the public key associated with this chain.
            const currentRemoteKey = this.remoteRatchetKey;
            if (currentRemoteKey) {
                const keyId = bytesToHex(currentRemoteKey) + '_' + this.nr;
                this.skippedMessageKeys.set(keyId, mk);
            }
            this.nr++;
        }
    }

    public async decrypt(encryptedMessage: EncryptedMessage): Promise<Uint8Array> {
        const { header, ciphertext } = encryptedMessage;
        const ad = this.encodeHeader(header);
        console.log('--------- DoubleRatchet decrypt ---------');
        console.log('header', header);
        console.log('ciphertext', bytesToHex(ciphertext));
        console.log('ad', new TextDecoder().decode(ad));

        // 1. Try Skipped Keys
        const plaintext = await this.trySkippedMessageKeys(header, ciphertext, ad);
        if (plaintext) return plaintext;
        console.log('plaintext', plaintext ? bytesToHex(plaintext) : 'null');

        // 2. Ratchet Step?
        if (!this.remoteRatchetKey || !this.arraysEqual(header.publicKey, this.remoteRatchetKey)) {
            // New Ratchet Step

            // Advance previous chain to catch up to 'pn'
            // The 'pn' in the header counts how many messages were sent in the PREVIOUS chain (the one we currently hold as chainRecv).
            if (this.chainKeyRecv) {
                await this.skipMessageKeys(header.pn);
            }

            // Perform DH Ratchet
            await this.dhRatchet(header);
        }
        console.log('rootKey', bytesToHex(this.rootKey));
        console.log('chainKeyRecv', this.chainKeyRecv ? bytesToHex(this.chainKeyRecv) : 'null');
        console.log('remoteRatchetKey', this.remoteRatchetKey ? bytesToHex(this.remoteRatchetKey) : 'null');
        console.log('chainKeySend', this.chainKeySend ? bytesToHex(this.chainKeySend) : 'null');

        // 3. Advance Chain to header.n
        await this.skipMessageKeys(header.n);

        // 4. Decrypt Key for Message n
        const [nextCKr, mk] = this.kdfCK(this.chainKeyRecv!); // Assumed initialized by simple or dhRatchet
        this.chainKeyRecv = nextCKr;
        this.nr++;

        try {
            console.log("AES Decrypting with key length:", mk.length, "Ciphertext len:", ciphertext.length);
            console.log("AES Decrypting with key:", bytesToHex(mk));
            console.log("AES Decrypting with AD:", bytesToHex(ad));
            console.log("AES Decrypting with Ciphertext:", bytesToHex(ciphertext));
            return await aesDecrypt(mk, ciphertext, ad);
        } catch (e) {
            console.error("AES Decrypt Error internal:", e);
            console.log("Failed Ciphertext (hex):", bytesToHex(ciphertext));
            console.log("Failed AD (utf8):", new TextDecoder().decode(ad));
            throw new Error("Decryption failed. Bad Key or MAC.");
        }
    }

    private async dhRatchet(header: RatchetHeader) {
        // A. DH with Current My Priv + New Remote Pub
        const dhOut1 = x25519.getSharedSecret(this.myRatchetKey.private, header.publicKey);
        const [newRK1, newCKr] = this.kdfRK(this.rootKey, dhOut1);
        this.rootKey = newRK1;
        this.chainKeyRecv = newCKr;
        this.remoteRatchetKey = header.publicKey;

        // B. DH with New My Priv + New Remote Pub
        const newPriv = x25519.utils.randomSecretKey();
        const newPub = x25519.getPublicKey(newPriv);
        this.myRatchetKey = { private: newPriv, public: newPub };

        const dhOut2 = x25519.getSharedSecret(this.myRatchetKey.private, this.remoteRatchetKey);
        const [newRK2, newCKs] = this.kdfRK(this.rootKey, dhOut2);
        this.rootKey = newRK2;
        this.chainKeySend = newCKs;

        this.pn = this.ns;
        this.ns = 0;
        this.nr = 0;
    }

    private encodeHeader(h: RatchetHeader): Uint8Array {
        return new TextEncoder().encode(JSON.stringify({
            pk: bytesToHex(h.publicKey),
            pn: h.pn,
            n: h.n
        }));
    }

    private arraysEqual(a: Uint8Array, b: Uint8Array): boolean {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }

    public serialize(): string {
        return JSON.stringify({
            rootKey: bytesToHex(this.rootKey),
            chainKeySend: this.chainKeySend ? bytesToHex(this.chainKeySend) : null,
            chainKeyRecv: this.chainKeyRecv ? bytesToHex(this.chainKeyRecv) : null,
            myRatchetKey: {
                private: bytesToHex(this.myRatchetKey.private),
                public: bytesToHex(this.myRatchetKey.public)
            },
            remoteRatchetKey: this.remoteRatchetKey ? bytesToHex(this.remoteRatchetKey) : null,
            ns: this.ns,
            nr: this.nr,
            pn: this.pn,
            skippedMessageKeys: Array.from(this.skippedMessageKeys.entries()).map(([k, v]) => [k, bytesToHex(v)])
        });
    }

    public static deserialize(json: string): SessionManager {
        const data = JSON.parse(json);
        const dummyKey = new Uint8Array(32); // 32 bytes dummy
        // Create dummy instance as 'responder' to avoid immediate DH calculation in constructor
        const session = new SessionManager(dummyKey, 'responder');

        session.rootKey = hexToBytes(data.rootKey);
        session.chainKeySend = data.chainKeySend ? hexToBytes(data.chainKeySend) : null;
        session.chainKeyRecv = data.chainKeyRecv ? hexToBytes(data.chainKeyRecv) : null;

        session.myRatchetKey = {
            private: hexToBytes(data.myRatchetKey.private),
            public: hexToBytes(data.myRatchetKey.public)
        };
        session.remoteRatchetKey = data.remoteRatchetKey ? hexToBytes(data.remoteRatchetKey) : null;

        session.ns = data.ns;
        session.nr = data.nr;
        session.pn = data.pn;

        if (data.skippedMessageKeys) {
            session.skippedMessageKeys = new Map(
                data.skippedMessageKeys.map(([k, v]: [string, string]) => [k, hexToBytes(v)])
            );
        }

        return session;
    }
}
