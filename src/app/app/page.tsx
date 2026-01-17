"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect, useState } from "react";
import bs58 from "bs58";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { BrandLogo } from "@/components/ui/BrandLogo";
import Link from "next/link";

export default function AppPage() {
    const { connected, signMessage, publicKey } = useWallet();
    const [signature, setSignature] = useState<string | null>(null);
    const [signedMessage, setSignedMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSign = async () => {
        setError(null);
        if (connected && signMessage && publicKey) {
            try {
                const messageContent = `Welcome to Lynq!\n\nPlease sign this message to verify your wallet ownership and access the application.\n\nWallet: ${publicKey.toBase58()}\nTimestamp: ${new Date().toISOString()}`;
                const message = new TextEncoder().encode(messageContent);
                const sig = await signMessage(message);
                const sigBase58 = bs58.encode(sig);
                setSignature(sigBase58);
                setSignedMessage(messageContent);
            } catch (e: any) {
                console.error("Signing failed", e);
                setError(e.message || "Signing failed");
            }
        }
    };

    useEffect(() => {
        if (!connected) {
            setSignature(null);
            setSignedMessage(null);
            setError(null);
        }
    }, [connected]);

    // APP VIEW
    // If we have a signature, we are "Logged In" -> Show ChatLayout
    if (connected && signature) {
        return <ChatLayout authSignature={signature} authMessage={signedMessage || undefined} />;
    }

    // Otherwise show Login Screen
    return (
        <main className="relative min-h-screen overflow-hidden flex items-center justify-center network-bg font-sans selection:bg-primary selection:text-white">
            {/* Background Animation Layer */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="network-grid w-full h-full absolute inset-0"></div>
                {/* Floating Nodes */}
                <div className="node"></div>
                <div className="node"></div>
                <div className="node"></div>
                <div className="node"></div>
                <div className="node"></div>
                <div className="node"></div>
                <div className="node"></div>
                <div className="node"></div>
                <div className="node"></div>
                <div className="connection-line"></div>
                <div className="connection-line"></div>
                <div className="connection-line"></div>
            </div>

            {/* Glowing Orbs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-md px-4">
                <Card className="glass-card border-glass-border shadow-2xl backdrop-blur-xl">
                    <CardHeader className="text-center flex flex-col items-center pb-2">
                        <div className="mb-6 scale-110">
                            <BrandLogo />
                        </div>
                        <CardTitle className="text-3xl font-bold text-white tracking-tight">Welcome Back</CardTitle>
                        <CardDescription className="text-gray-400 mt-2 text-base">
                            Connect your Solana wallet to access <br />
                            the private communication layer.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-6 pt-6">
                        <div className="w-full flex justify-center transform hover:scale-105 transition-transform duration-300">
                            {/* @ts-ignore */}
                            <WalletMultiButton style={{
                                backgroundColor: "var(--color-brand-ultraviolet)",
                                height: "48px",
                                borderRadius: "0.5rem",
                                fontWeight: "600",
                                fontFamily: "var(--font-display)"
                            }} />
                        </div>

                        {connected && (
                            <div className="flex w-full flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <Button
                                    onClick={handleSign}
                                    className="w-full h-12 bg-linear-to-r from-brand-ultraviolet to-[#6015AB] hover:opacity-90 text-white font-bold text-lg shadow-[0_0_20px_rgba(138,46,255,0.3)] transition-all border-none"
                                >
                                    Sign Message to Login
                                </Button>
                                {error && (
                                    <div className="text-center text-sm text-status-crimson bg-status-crimson/10 py-2 px-3 rounded-md border border-status-crimson/20">
                                        {error}
                                    </div>
                                )}
                            </div>
                        )}

                        <Link href="/" className="w-full">
                            <Button variant="ghost" className="w-full text-gray-500 hover:text-white hover:bg-white/5 transition-colors">
                                Back to Home
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Footer simple text */}
                <div className="text-center mt-8 text-gray-500 text-xs font-mono">
                    <p>Protected by End-to-End Zero Knowledge Proofs</p>
                </div>
            </div>
        </main>
    );
}
