"use client";

import React from "react";

interface HeroProps {
    onLaunch?: () => void;
}

export function Hero({ onLaunch }: HeroProps) {
    return (
        <section className="relative pt-32 pb-20 overflow-hidden min-h-screen flex items-center network-bg">
            <div className="absolute inset-0 pointer-events-none">
                <div className="network-grid w-full h-full absolute inset-0"></div>
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
                <div className="connection-line"></div>
                <div className="connection-line"></div>
                <div className="connection-line"></div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none">
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10 w-full grid lg:grid-cols-2 gap-12 items-center">
                {/* Hero Content */}
                <div className="flex flex-col gap-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 w-fit">
                        <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                        <span className="text-xs font-bold text-primary tracking-wide uppercase font-mono">
                            Protocol Alpha Live
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-white">
                        The Private <br />
                        <span className="text-gradient">Communication</span> <br />
                        Layer for Solana
                    </h1>
                    <p className="text-lg text-gray-400 max-w-xl leading-relaxed">
                        Transform every interaction into a ZK-verified, end-to-end encrypted
                        signal. Lynq unifies private messaging and confidential payments
                        on-chain, powered by SPL Token-2022.
                    </p>
                    <div className="flex flex-wrap gap-4 font-mono text-sm text-gray-300">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-lg">
                                lock
                            </span>
                            Wallet-to-Wallet Encryption
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-secondary text-lg">
                                verified_user
                            </span>
                            Confidential Settlements
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-accent text-lg">
                                hub
                            </span>
                            Evolving Ecosystem
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-4">
                        <button
                            onClick={onLaunch}
                            className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-3 rounded-lg transition-all neon-border cursor-pointer"
                        >
                            Launch App
                        </button>
                        <a
                            // href="https://pump.fun"
                            // target="_blank"
                            href="#"
                            rel="noopener noreferrer"
                            className="bg-surface-dark border border-glass-border hover:border-white/20 text-white font-bold px-6 py-3 rounded-lg transition-all cursor-pointer flex items-center"
                        >
                            Buy $LYNQ
                        </a>
                        {/* <button className="text-gray-400 hover:text-white font-medium px-4 py-3 underline decoration-gray-600 underline-offset-4 transition-colors cursor-pointer">
                            Read Whitepaper
                        </button> */}
                    </div>
                </div>

                {/* Hero Visual */}
                <div className="relative h-[400px] lg:h-[600px] flex items-center justify-center">
                    {/* Abstract Network Ring (CSS only) */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-[300px] h-[300px] border border-primary/30 rounded-full animate-signal text-primary"></div>
                        <div className="absolute w-[450px] h-[450px] border border-dashed border-secondary/30 rounded-full animate-signal delay-1000 text-secondary"></div>
                        <div className="absolute w-[600px] h-[600px] border border-white/10 rounded-full animate-signal delay-2000 text-white"></div>
                    </div>
                    {/* Floating Cards */}
                    <div className="relative z-10 flex flex-col gap-6 w-full max-w-sm">
                        {/* Messenger Card */}
                        <div className="glass-card p-5 rounded-xl transform translate-x-4 rotate-2 transition-transform hover:rotate-0 hover:scale-105 duration-500">
                            <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">
                                        chat_bubble
                                    </span>
                                    <span className="font-bold text-white">Lynq Messenger</span>
                                </div>
                                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded font-mono">
                                    ALPHA
                                </span>
                            </div>
                            <div className="space-y-3">
                                <div className="h-2 bg-white/10 rounded w-3/4 animate-pulse"></div>
                                <div className="h-2 bg-white/10 rounded w-1/2"></div>
                                <div className="flex items-center gap-2 mt-4 text-xs text-accent font-mono">
                                    <span className="material-symbols-outlined text-[14px]">
                                        lock
                                    </span>
                                    End-to-End Encrypted
                                </div>
                            </div>
                        </div>
                        {/* Pay Card */}
                        <div className="glass-card p-5 rounded-xl transform -translate-x-4 -rotate-2 transition-transform hover:rotate-0 hover:scale-105 duration-500 bg-surface-dark/90">
                            <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-secondary">
                                        payments
                                    </span>
                                    <span className="font-bold text-white">Lynq Pay</span>
                                </div>
                                <span className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded font-mono">
                                    ALPHA
                                </span>
                            </div>
                            <div className="flex justify-between items-end">
                                <div>
                                    <div className="text-xs text-gray-400 mb-1">
                                        Confidential Transfer
                                    </div>
                                    <div className="text-2xl font-mono font-bold tracking-tighter text-white">
                                        *** SOL
                                    </div>
                                </div>
                                <div className="text-xs text-accent font-mono flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">
                                        verified
                                    </span>
                                    ZK Verified
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
