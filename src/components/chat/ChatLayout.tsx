"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useLynqSocket } from "@/hooks/useLynqSocket";
import { useEncryption } from "@/hooks/useEncryption";
import { useChatPersistence } from "@/hooks/useChatPersistence";
import { Sidebar } from "./Sidebar";
import { ChatWindow } from "./ChatWindow";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { serializePublicBundle, deserializePublicBundle } from "@/lib/crypto/KeyBundle";
import { bytesToHex } from "@noble/curves/utils.js";
import { UserPlus, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatLayoutProps {
    authSignature: string | null;
    authMessage?: string;
}

export function ChatLayout({ authSignature, authMessage }: ChatLayoutProps) {
    const { publicKey } = useWallet();
    const { isConnected, sendMessage, messages: rawMessages } = useLynqSocket(authSignature, authMessage);
    const { encryptMessage, decryptMessage, myPublicKey, myBundlePublic, isReady } = useEncryption();
    const { saveSentMessage, saveReceivedMessage, deleteConversation } = useChatPersistence(rawMessages, decryptMessage, myPublicKey);

    const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
    const [newChatOpen, setNewChatOpen] = useState(false);
    const [newChatAddress, setNewChatAddress] = useState("");
    const [newChatBundle, setNewChatBundle] = useState("");
    const [tempBundles, setTempBundles] = useState<Record<string, string>>({}); // Temporary store for bundles from UI

    // Handle Incoming Messages
    useEffect(() => {
        // Process messages from the socket and persist them
        const process = async () => {
            // Logic to avoid re-processing or implement better persistence 
            // to be expanded in next phases.
        };
    }, [rawMessages]);

    const sendEncryptedMessage = async (recipient: string, content: string) => {
        try {
            // 1. Encrypt
            let bundle = undefined;

            // Check if we have a pending bundle from the UI input
            if (tempBundles[recipient]) {
                try {
                    bundle = deserializePublicBundle(JSON.parse(tempBundles[recipient].trim()));
                } catch (e) {
                    console.error("Invalid bundle JSON", e);
                }
            } else {
                try {
                    // eslint-disable-next-line @typescript-eslint/no-var-requires
                    const { db } = require("@/lib/db");
                    const conv = await db.conversations.get(recipient);
                    if (conv?.publicBundle) {
                        bundle = deserializePublicBundle(JSON.parse(conv.publicBundle));
                    }
                } catch (e) {
                    console.warn("Failed to load bundle from DB", e);
                }
            }

            const encrypted = await encryptMessage(recipient, content, bundle);

            if (encrypted.isPreKeyMessage) {
                if (!myBundlePublic) {
                    throw new Error("Cannot send initial message: myBundlePublic is missing (Identity not loaded?)");
                }
                console.log("Adding Identity DH Key to payload:", bytesToHex(myBundlePublic.identityDHKey));
            }

            // 2. Prepare Payload
            const wirePayload = JSON.stringify({
                header: {
                    pk: bytesToHex(encrypted.header.publicKey),
                    pn: encrypted.header.pn,
                    n: encrypted.header.n
                },
                body: encrypted.ciphertext,
                // Pass the X25519 DH Key as 'identityKey' because x3dhReceive expects the DH key
                identityKey: encrypted.isPreKeyMessage && myBundlePublic ? bytesToHex(myBundlePublic.identityDHKey) : undefined,
                oneTimeKeyId: encrypted.oneTimeKeyId,
                senderWallet: publicKey?.toBase58(),
            });
            const finalCipherField = bytesToHex(new TextEncoder().encode(wirePayload));

            // 3. Send via Socket
            sendMessage(recipient, {
                ciphertext: finalCipherField,
                ephemeralKey: encrypted.ephemeralKey,
                nonce: Date.now().toString()
            });
            return true;
        } catch (e: any) {
            console.error("Internal Send Failed", e);
            return false;
        }
    };

    const handleSendMessage = async (text: string) => {
        if (!selectedRecipient) return;
        const success = await sendEncryptedMessage(selectedRecipient, text);
        if (success) {
            await saveSentMessage(selectedRecipient, text);
        }
    };

    const handleSendPayment = async (signature: string) => {
        if (!selectedRecipient) return;
        const paymentPayload = JSON.stringify({
            type: 'payment',
            content: 'Confidential Transfer Sent',
            signature: signature
        });
        await sendEncryptedMessage(selectedRecipient, paymentPayload);
    };

    const startNewChat = () => {
        if (!newChatAddress) return;

        // Store the bundle if provided
        if (newChatBundle) {
            setTempBundles(prev => ({
                ...prev,
                [newChatAddress.trim()]: newChatBundle.trim()
            }));
        }

        const recipientAddr = newChatAddress.trim();
        const bundleStr = newChatBundle.trim();

        // Initialize DB entry
        // We pass the bundle to save it permanently in the conversation record
        saveSentMessage(recipientAddr, "Draft: Started conversation", bundleStr).then(() => {
            setSelectedRecipient(recipientAddr);
            setNewChatOpen(false);
            // Clear input
            setNewChatAddress("");
            setNewChatBundle("");
        });
    };

    return (
        <div className="relative flex h-screen overflow-hidden network-bg bg-background-dark/90 font-sans">
            {/* Background Animation Layer */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="network-grid w-full h-full absolute inset-0 opacity-20"></div>
                {/* Fewer Floating Nodes for subtle effect */}
                <div className="node hover:opacity-100 transition-opacity"></div>
                <div className="node" style={{ animationDelay: '2s', top: '20%', left: '80%' }}></div>
                <div className="node" style={{ animationDelay: '5s', top: '70%', left: '10%' }}></div>
                <div className="connection-line opacity-10"></div>
            </div>

            {/* Sidebar with Glass Styling */}
            <div className={cn(
                "relative z-10 shrink-0 h-full transition-all duration-300 ease-in-out border-r border-glass-border backdrop-blur-xl bg-surface-dark/40",
                selectedRecipient ? "hidden md:block" : "w-full md:w-auto"
            )}>
                <Sidebar
                    currentRecipient={selectedRecipient}
                    onSelectRecipient={setSelectedRecipient}
                    myBundlePublic={myBundlePublic}
                />
                {/* Floating Action Button for New Chat */}
                <div className="absolute bottom-6 right-6">
                    <Dialog open={newChatOpen} onOpenChange={setNewChatOpen}>
                        <DialogTrigger asChild>
                            <Button className="rounded-full h-14 w-14 bg-linear-to-r from-brand-ultraviolet to-[#6015AB] hover:shadow-[0_0_20px_rgba(138,46,255,0.4)] hover:scale-105 transition-all shadow-lg border border-white/10" size="icon">
                                <UserPlus className="h-6 w-6 text-white" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-card border-glass-border text-white sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold">New Conversation</DialogTitle>
                                <DialogDescription className="text-gray-400">Enter a Solana Wallet Address to start chatting.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium text-gray-300">Wallet Address</label>
                                    <Input
                                        className="bg-black/20 border-glass-border text-white focus:border-brand-ultraviolet/50 placeholder:text-gray-600"
                                        value={newChatAddress}
                                        onChange={e => setNewChatAddress(e.target.value)}
                                        placeholder="Address..."
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium text-gray-300">Public Bundle (Optional)</label>
                                    <Input
                                        className="bg-black/20 border-glass-border text-white focus:border-brand-ultraviolet/50 placeholder:text-gray-600"
                                        placeholder="Paste JSON bundle..."
                                        value={newChatBundle}
                                        onChange={e => setNewChatBundle(e.target.value)}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={startNewChat} className="bg-brand-ultraviolet hover:bg-brand-ultraviolet/80 text-white w-full">Start Chat</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={cn(
                "relative z-10 flex-1 h-full flex flex-col bg-transparent",
                !selectedRecipient ? "hidden md:flex" : "flex"
            )}>
                <ChatWindow
                    recipient={selectedRecipient}
                    onSendMessage={handleSendMessage}
                    onSendPayment={handleSendPayment}
                    myPublicKey={myPublicKey}
                    isConnected={isConnected}
                    onDeleteConversation={async () => {
                        if (selectedRecipient) {
                            await deleteConversation(selectedRecipient);
                            setSelectedRecipient(null);
                        }
                    }}
                    onBack={() => setSelectedRecipient(null)}
                />
            </div>
        </div>
    );
}
