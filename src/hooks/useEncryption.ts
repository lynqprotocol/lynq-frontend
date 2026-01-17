import { useState, useEffect, useCallback, useRef } from 'react';
import { KeyBundle, PreKeyBundlePublic, x3dhInitiate, x3dhReceive } from '../lib/crypto/KeyBundle';
import { SessionManager, EncryptedMessage } from '../lib/crypto/DoubleRatchet';
import { bytesToHex, hexToBytes } from '@noble/curves/utils.js';

const STORAGE_KEY = 'lynq_identity_v1';

export const useEncryption = () => {
    const [myBundle, setMyBundle] = useState<KeyBundle | null>(null);
    const sessionsRef = useRef<Map<string, SessionManager>>(new Map());

    // 1. Load or Generate Identity on Startup
    useEffect(() => {
        const loadIdentity = async () => {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    const bundle = new KeyBundle();
                    // Hydrate keys
                    Object.assign(bundle, {
                        identityKey: { private: hexToBytes(parsed.identityKey.private), public: hexToBytes(parsed.identityKey.public) },
                        identityDHKey: { private: hexToBytes(parsed.identityDHKey.private), public: hexToBytes(parsed.identityDHKey.public) },
                        identityDHKeySignature: hexToBytes(parsed.identityDHKeySignature),
                        signedPreKey: { private: hexToBytes(parsed.signedPreKey.private), public: hexToBytes(parsed.signedPreKey.public) },
                        signedPreKeySignature: hexToBytes(parsed.signedPreKeySignature),
                        oneTimePreKeys: parsed.oneTimePreKeys.map((k: any) => ({
                            id: k.id,
                            private: hexToBytes(k.private),
                            public: hexToBytes(k.public)
                        }))
                    });
                    setMyBundle(bundle);
                    console.log("Encryption Identity Loaded from Storage");
                } catch (e) {
                    console.error("Failed to load identity", e);
                    await generateAndStore();
                }
            } else {
                await generateAndStore();
            }
        };

        loadIdentity();
    }, []);

    const generateAndStore = async () => {
        console.log("Generating new Identity...");
        const bundle = new KeyBundle();
        setMyBundle(bundle);

        const serializable = {
            identityKey: { private: bytesToHex(bundle.identityKey.private), public: bytesToHex(bundle.identityKey.public) },
            identityDHKey: { private: bytesToHex(bundle.identityDHKey.private), public: bytesToHex(bundle.identityDHKey.public) },
            identityDHKeySignature: bytesToHex(bundle.identityDHKeySignature),
            signedPreKey: { private: bytesToHex(bundle.signedPreKey.private), public: bytesToHex(bundle.signedPreKey.public) },
            signedPreKeySignature: bytesToHex(bundle.signedPreKeySignature),
            oneTimePreKeys: bundle.oneTimePreKeys.map((k: any) => ({
                id: k.id,
                private: bytesToHex(k.private),
                public: bytesToHex(k.public)
            }))
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
    };

    const getSession = (wallet: string) => {
        if (sessionsRef.current.has(wallet)) return sessionsRef.current.get(wallet);
        const stored = localStorage.getItem('lynq_session_v1_' + wallet);
        if (stored) {
            try {
                const session = SessionManager.deserialize(stored);
                sessionsRef.current.set(wallet, session);
                return session;
            } catch (e) {
                console.error("Failed to deserialize session", e);
            }
        }
        return undefined;
    };

    const saveSession = (wallet: string, session: SessionManager) => {
        sessionsRef.current.set(wallet, session);
        localStorage.setItem('lynq_session_v1_' + wallet, session.serialize());
    };

    const startSession = async (wallet: string, recipientBundle: PreKeyBundlePublic) => {
        if (!myBundle) throw new Error("Identity not ready");

        // X3DH initiate
        const { sharedSecret, ephemeralPublicKey } = x3dhInitiate(
            myBundle.identityDHKey,
            recipientBundle,
            recipientBundle.identityDHKeySignature
        );

        console.log("X3DH Initiated. Shared Secret:", bytesToHex(sharedSecret));

        const session = new SessionManager(
            sharedSecret,
            'initiator',
            recipientBundle.signedPreKey.key
        );

        saveSession(wallet, session);
        return {
            session,
            ephemeralPublicKey,
            oneTimeKeyId: recipientBundle.oneTimePreKey?.id
        };
    };

    const encryptMessage = async (wallet: string, content: string, recipientBundle?: PreKeyBundlePublic) => {
        let session = getSession(wallet);
        let isPreKeyMessage = false;
        let usedEphemeralKey: Uint8Array | undefined;
        let usedOneTimeKeyId: number | undefined;

        if (!session) {
            if (!recipientBundle) throw new Error("No session and no recipient bundle provided");
            const res = await startSession(wallet, recipientBundle);
            session = res.session;
            usedEphemeralKey = res.ephemeralPublicKey;
            usedOneTimeKeyId = res.oneTimeKeyId;
            isPreKeyMessage = true;
        }

        if (!session) throw new Error("Failed to create session");

        const encrypted = await session.encrypt(content);

        // Save updated session state
        saveSession(wallet, session);

        return {
            header: encrypted.header,
            ciphertext: bytesToHex(encrypted.ciphertext),
            isPreKeyMessage,
            ephemeralKey: usedEphemeralKey ? bytesToHex(usedEphemeralKey) : undefined,
            oneTimeKeyId: usedOneTimeKeyId
        };
    };

    const decryptMessage = async (senderWallet: string, packet: any) => {
        // Packet structure expected: { ciphertext: string (hex), ephemeral_key: string (hex, optional) }
        let session = getSession(senderWallet);

        if (!packet.ciphertext) throw new Error("Missing ciphertext");

        let innerCipher: any;
        try {
            // Decode Hex -> JSON String -> Object
            const jsonStr = new TextDecoder().decode(hexToBytes(packet.ciphertext));
            innerCipher = JSON.parse(jsonStr);
        } catch (e) {
            console.error("Unknown ciphertext format", e);
            throw new Error("Unknown ciphertext format");
        }

        if (!session) {
            // Must be PreKey Message?
            if (!packet.ephemeral_key) throw new Error("No session and no ephemeral key for X3DH");
            if (!myBundle) throw new Error("Identity not ready");

            if (!innerCipher.identityKey) throw new Error("Initial message missing sender identity key");

            const senderIK = hexToBytes(innerCipher.identityKey);
            const ek = hexToBytes(packet.ephemeral_key);
            console.log('senderIK', senderIK);
            console.log('ek', ek);
            console.log('innerCipher.oneTimeKeyId', innerCipher.oneTimeKeyId);

            const sharedSecret = x3dhReceive(
                myBundle,
                senderIK,
                ek,
                innerCipher.oneTimeKeyId
            );
            console.log('sharedSecret', bytesToHex(sharedSecret));

            // Create Session (Responder)
            // We MUST use our Signed PreKey as the initial Ratchet Key because the Sender initialized 
            // the session using our Signed PreKey as the 'remoteRatchetKey' in startSession.
            session = new SessionManager(
                sharedSecret,
                'responder',
                undefined, // remoteRatchetKey is unknown until we parse header
                myBundle.signedPreKey // Force initial ratchet key to be my SPK
            );

            // Save new session
            saveSession(senderWallet, session);
        }

        if (!session) throw new Error("Session init failed");

        // Verify header existence
        if (!innerCipher.header || !innerCipher.body) throw new Error("Invalid message format: missing header or body");

        const msg: EncryptedMessage = {
            header: {
                publicKey: hexToBytes(innerCipher.header.pk),
                pn: innerCipher.header.pn,
                n: innerCipher.header.n
            },
            ciphertext: hexToBytes(innerCipher.body)
        };

        const plainBytes = await session.decrypt(msg);

        // Save updated session state
        saveSession(senderWallet, session);

        return new TextDecoder().decode(plainBytes);
    };

    return {
        isReady: !!myBundle,
        myPublicKey: myBundle ? bytesToHex(myBundle.identityKey.public) : null,
        encryptMessage,
        decryptMessage,
        myBundlePublic: myBundle ? myBundle.getPublicBundle() : null
    };
};
