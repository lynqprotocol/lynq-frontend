export function Architecture() {
    return (
        <section
            className="py-24 bg-surface-dark border-t border-glass-border"
            id="technology"
        >
            <div className="max-w-7xl mx-auto px-6">
                <div className="mb-16">
                    <h2 className="text-3xl font-bold mb-4 text-white">
                        Encryption, ZK Proofs, and <br /> Confidential Settlement
                    </h2>
                    <div className="h-1 w-20 bg-linear-to-r from-primary to-secondary rounded"></div>
                </div>
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Tech Col 1 */}
                    <div className="flex flex-col gap-6">
                        <div className="p-6 rounded-xl bg-background-dark border border-white/5 hover:border-primary/50 transition-colors">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-bold text-white">Encryption Layer</h4>
                                <span className="material-symbols-outlined text-gray-500">
                                    lock_person
                                </span>
                            </div>
                            <p className="text-sm text-gray-400 mb-4">
                                Double-ratchet algorithm ensuring forward secrecy for all
                                wallet-based communications.
                            </p>
                            <div className="flex gap-2">
                                <span className="text-[10px] font-mono bg-primary/10 text-primary px-2 py-1 rounded">
                                    X25519
                                </span>
                                <span className="text-[10px] font-mono bg-primary/10 text-primary px-2 py-1 rounded">
                                    AES-256
                                </span>
                            </div>
                        </div>
                        <div className="p-6 rounded-xl bg-background-dark border border-white/5 hover:border-accent/50 transition-colors">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-bold text-white">ZK Verification Layer</h4>
                                <span className="material-symbols-outlined text-gray-500">
                                    fingerprint
                                </span>
                            </div>
                            <p className="text-sm text-gray-400 mb-4">
                                Proves identity traits or solvency without revealing the
                                underlying data or values.
                            </p>
                            <div className="flex gap-2">
                                <span className="text-[10px] font-mono bg-accent/10 text-accent px-2 py-1 rounded">
                                    zk-SNARKs
                                </span>
                                <span className="text-[10px] font-mono bg-accent/10 text-accent px-2 py-1 rounded">
                                    Groth16
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* Center Diagram Placehoder / Animation */}
                    <div className="hidden lg:flex flex-col items-center justify-center relative">
                        <div className="w-px h-full bg-linear-to-b from-transparent via-white/20 to-transparent absolute left-1/2 -translate-x-1/2"></div>
                        <div className="z-10 bg-background-dark border border-glass-border p-4 rounded-full mb-8 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                            <span className="material-symbols-outlined text-4xl text-white">
                                hub
                            </span>
                        </div>
                        <div className="z-10 bg-background-dark border border-glass-border p-4 rounded-full mt-8 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                            <span className="material-symbols-outlined text-4xl text-white">
                                token
                            </span>
                        </div>
                    </div>
                    {/* Tech Col 2 */}
                    <div className="flex flex-col gap-6 lg:mt-12">
                        <div className="p-6 rounded-xl bg-background-dark border border-white/5 hover:border-secondary/50 transition-colors">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-bold text-white">Confidential Payments</h4>
                                <span className="material-symbols-outlined text-gray-500">
                                    account_balance
                                </span>
                            </div>
                            <p className="text-sm text-gray-400 mb-4">
                                Leveraging Solana's Token-2022 program for native confidential
                                transfer extensions.
                            </p>
                            <div className="flex gap-2">
                                <span className="text-[10px] font-mono bg-secondary/10 text-secondary px-2 py-1 rounded">
                                    Token-22
                                </span>
                                <span className="text-[10px] font-mono bg-secondary/10 text-secondary px-2 py-1 rounded">
                                    ElGamal
                                </span>
                            </div>
                        </div>
                        <div className="p-6 rounded-xl bg-background-dark border border-white/5 hover:border-warning/50 transition-colors">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-bold text-white">On-Chain Comms</h4>
                                <span className="material-symbols-outlined text-gray-500">
                                    cell_tower
                                </span>
                            </div>
                            <p className="text-sm text-gray-400 mb-4">
                                Decentralized signal routing preventing censorship and ensuring
                                100% uptime.
                            </p>
                            <div className="flex gap-2">
                                <span className="text-[10px] font-mono bg-warning/10 text-warning px-2 py-1 rounded">
                                    Gossip
                                </span>
                                <span className="text-[10px] font-mono bg-warning/10 text-warning px-2 py-1 rounded">
                                    P2P
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
